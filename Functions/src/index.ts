import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Message, Device, Conversation, User, Participant } from './model/model';
import { findRepeatingElement, createNotificationMessagePayload, getWhiteListURL } from './services/tool';
import * as cors from 'cors';
admin.initializeApp();
import { WriteConversation, AddParticipantToConversation } from './services/conversations';

const corsHandler = cors({ origin: getWhiteListURL(), methods: 'GET' });

const _db = admin.firestore();
const userRef = _db.collection('users');

export const updateMessageAsRead = functions.firestore.document('users/{userId}/conversations/{conversationId}/messages/{messageId}').onCreate(async (snapshot, context) => {
    await userRef.doc(context.params.userId)
        .collection('conversations').doc(context.params.conversationId)
        .collection('messages').doc(context.params.messageId).update('isSended', true);
});

export const inComingMessageNotification = functions.firestore
    .document('users/{userId}/conversations/{conversationId}/messages/{messageId}')
    .onCreate(async (snap, context) => {

        // Gönderilen Mesaj Datası
        const messageData = snap.data() as Message;

        // Gönderen ve alıcı userId ( Hem Gönderen hem de alıcı mesaj koleksiyonuna sahip )
        const userId: string = context.params.userId as string;

        // Gönderici' nin koleksiyonuna da mesajı yazdığımız için gönderici bilgisi de gelir ama ona bildirim gitmemesi için burada return ediyoruz.
        if (userId === messageData.sender.userId) {
            console.log('Mesaj sahibine bildirim gitmez!');
            return 'Owner!';
        }

        // Alıcı device token koleksiyonu
        const tokenRef = _db.collection('users').doc(userId).collection('devices');

        // Alıcı device token koleksiyonu (Promise)
        const getTokenPromises = await tokenRef.get();

        // Kişinin device koleksiyonundaki bütün datayı allTokens' a attık.
        const allTokens: Device[] = getTokenPromises.docs.map((doc: any) => doc.data());

        // Check if there are any device tokens.
        // Receiver' ın herhangi bir cihazı kayıtlı değilse ona bildirim atamayız. Bu sebeple burdan return diyoruz.
        if (allTokens.length === 0) {
            console.log('There are no notification tokens to send to.');
            return 'There are no notification tokens to send to.';
        }

        // array[0] Kişinin kullanıbilir device token bilgileri, array[1] Kişinin çoklanmış token bilgilerinin indexleri
        const array = findRepeatingElement(allTokens);
        const deviceTokens = array[0] as Device[];

        const tokens = deviceTokens.map(p => p.token);

        const indexes = array[1] as number[];

        // Silinecek Tokenlar
        const tokensToRemove: any[] = [];
        indexes.forEach(element => {
            tokensToRemove.push(tokenRef.doc(allTokens[element].key).delete());
        });

        // Notification Datası
        const payload: admin.messaging.MessagingPayload = createNotificationMessagePayload(messageData);

        // Send notifications to all tokens.

        const response = await admin.messaging().sendToDevice(tokens, payload);
        // For each message check if there was an error.

        response.results.forEach((result, index) => {
            const error = result.error;
            if (error) {
                console.error('Failure sending notification to', tokens[index], error);
                // Cleanup the tokens who are not registered anymore.
                if (error.code === 'messaging/invalid-registration-token' ||
                    error.code === 'messaging/registration-token-not-registered') {
                    tokensToRemove.push(tokenRef.doc(deviceTokens[index].key).delete());
                }
            }
        });
        return Promise.all(tokensToRemove);
    });

export const updateConversationsOwner = functions.firestore.document('users/{userId}').onUpdate(async (snap, context) => {
    const userId: string = context.params.userId;
    const user: User = snap.after.data() as User;
    const userPromise = await userRef.get();
    userPromise.forEach(async element => {
        const conRef = userRef.doc(element.id).collection('conversations');
        const conPromise = await conRef.get()
        conPromise.forEach(item => {
            const conversation: Conversation = item.data() as Conversation;
            if (conversation.owner.userId === userId) {
                conRef.doc(item.id).update('owner', user).then(() => console.log('BAŞARILI')).catch(e => console.log('HATA'));
            }
        });
    })
});

export const updateParticipantUser = functions.firestore.document('users/{userId}').onUpdate(async (snap, context) => {
    const userId: string = context.params.userId;
    const user: User = snap.after.data() as User;
    const userPromise = await userRef.get();
    userPromise.forEach(async element => {
        const conRef = userRef.doc(element.id).collection('conversations');
        const conPromise = await conRef.get()
        conPromise.forEach(async item => {
            const participRef = conRef.doc(item.id).collection('participants');
            const participantPromises = await participRef.get();
            participantPromises.forEach(it => {
                const participant: Participant = it.data() as Participant;
                if (participant.user.userId === userId) {
                    participRef.doc(it.id).update('user', user).then(() => console.log('BAŞARILI')).catch(e => console.log('HATA'));
                }
            });
        });
    })
});

// export const firstUserRecord = functions.firestore.document('users/{userId}').onCreate(async (snap, context) => {
//     const userId: string = context.params.userId;
//     const conversationRef = userRef.doc(userId).collection('conversations');
//     const conversationRefKey = conversationRef.doc().id;
//     const participantRef = conversationRef.doc(conversationRefKey).collection('participants');
//     const participantRefKey = participantRef.doc().id;
//     const messageRef = conversationRef.doc(conversationRefKey).collection('messages');
//     const messageRefKey = messageRef.doc().id;
//     const arr: any[] = [
//         conversationRef.doc(conversationRefKey).set({ 'conversationId': conversationRefKey }),
//         participantRef.doc(participantRefKey).set({ 'participantId': participantRefKey }),
//         messageRef.doc(messageRefKey).set({ 'messageId': messageRefKey }),
//     ];
//     Promise.all(arr).then(p => {
//         console.log('Başarılı!');
//     }).catch(e => {
//         console.log('HATA');
//     });
// });

export const createConversation = functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
        const ownerId: string = req.query.ownerId;
        const userId: string = req.query.userId;
        WriteConversation(ownerId, userId).then((conversationId: string) => {
            AddParticipantToConversation(ownerId, conversationId, userId).then(() => {
                res.send(conversationId);
            }).catch(e => {
                res.status(500).send(e);
            })
        }).catch(er => {
            res.status(500).send(er);
        });
    });
});


export const cloneConversation = functions.firestore.document('users/{userId}/conversations/{conversationId}/participants/{participantId}').onCreate(async (snapshot, context) => {
    const part: Participant = snapshot.data() as Participant;
    if (part.user.userId !== context.params.userId) {
        console.log(part);
        console.log('part : ' + part.user.userId);
        console.log('context : ' + context.params.userId);
        const conversation: Conversation = (await userRef.doc(context.params.userId)
        .collection('conversations').doc(context.params.conversationId).get()).data() as Conversation;
    userRef.doc(context.params.userId)
        .collection('conversations').doc(context.params.conversationId)
        .collection('participants').get().then(async p => {
            // ADD CONVERSATION
            p.forEach(async element => {
                const participant: Participant = element.data() as Participant;
                if (part.user.userId === participant.user.userId) {
                    await userRef.doc(part.user.userId)
                        .collection('conversations').doc(part.conversationId).set(Object.assign({},conversation))
                }
                await userRef.doc(part.user.userId)
                    .collection('conversations').doc(part.conversationId).collection('participants').doc(participant.participantId).set(Object.assign({},participant))
            });
        }).catch(e => {
            console.log(e);
        })
    }
    
})

// export const cloneConversation = functions.firestore.document('users/{userId}/conversations/{conversationId}/participants/{participantId}').onCreate(async (snapshot, context) => {
//     const part: Participant = snapshot.data() as Participant;
//     console.log(part);
//     console.log('part : ' + part.user.userId);
//     console.log('context : ' + context.params.userId);
//     const conversation: Conversation = (await userRef.doc(context.params.userId)
//         .collection('conversations').doc(context.params.conversationId).get()).data() as Conversation;
//     userRef.doc(context.params.userId)
//         .collection('conversations').doc(context.params.conversationId)
//         .collection('participants').get().then(async p => {
//             // ADD CONVERSATION
//             if (part.user.userId !== context.params.userId) {

//                 await userRef.doc(part.user.userId)
//                     .collection('conversations').doc(part.conversationId).set({
//                         conversationId: conversation.conversationId,
//                         createdTime: conversation.createdTime,
//                         isActive: conversation.isActive,
//                         isDeleted: conversation.isDeleted,
//                         owner: {
//                             userId: conversation.owner.userId,
//                             email: conversation.owner.email,
//                             avatar: conversation.owner.avatar === null ? null : {
//                                 avatarName: conversation.owner.avatar.avatarName,
//                                 contentType: conversation.owner.avatar.contentType,
//                                 deletedTime: conversation.owner.avatar.deletedTime,
//                                 isActive: conversation.owner.avatar.isActive,
//                                 isDeleted: conversation.owner.avatar.isDeleted,
//                                 size: conversation.owner.avatar.size,
//                                 downloadURL: conversation.owner.avatar.downloadURL
//                             },
//                             displayName: conversation.owner.displayName,
//                             bio: conversation.owner.bio,
//                             creationTime: conversation.owner.creationTime,
//                             isActive: conversation.owner.isActive,
//                             isDeleted: conversation.owner.isDeleted,
//                             settings: {
//                                 darkTheme: conversation.owner.settings.darkTheme,
//                                 isPrivate: conversation.owner.settings.isPrivate,
//                                 notify: conversation.owner.settings.notify
//                             },
//                             deletedTime: conversation.owner.deletedTime
//                         },
//                         deletedTime: conversation.deletedTime,
//                         title: conversation.title
//                     })

//             }
//             p.forEach(async element => {
//                 const participant: Participant = element.data() as Participant;


//                 await userRef.doc(part.user.userId)
//                     .collection('conversations').doc(part.conversationId).collection('participants').doc(participant.participantId).set({
//                         participantId: participant.participantId,
//                         conversationId: participant.conversationId,
//                         creationTime: participant.creationTime,
//                         type: participant.type,
//                         user: {
//                             userId: participant.user.userId,
//                             avatar: participant.user.avatar === null ? null : {
//                                 avatarName: participant.user.avatar.avatarName,
//                                 contentType: participant.user.avatar.contentType,
//                                 deletedTime: participant.user.avatar.deletedTime,
//                                 isActive: participant.user.avatar.isActive,
//                                 isDeleted: participant.user.avatar.isDeleted,
//                                 size: participant.user.avatar.size,
//                                 downloadURL: participant.user.avatar.downloadURL,
//                             },
//                             bio: participant.user.bio,
//                             creationTime: participant.user.creationTime,
//                             displayName: participant.user.displayName,
//                             email: participant.user.email,
//                             isActive: participant.user.isActive,
//                             isDeleted: participant.user.isDeleted,
//                             settings: {
//                                 darkTheme: participant.user.settings.darkTheme,
//                                 isPrivate: participant.user.settings.isPrivate,
//                                 notify: participant.user.settings.notify
//                             },
//                             deletedTime: participant.user.deletedTime
//                         }
//                     })
//             });
//         }).catch(e => {
//             console.log(e);
//         })
// })