import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Message, Device, Conversation, User, Participant } from './model/model';
import { findRepeatingElement } from './services/token';
import { createNotificationMessagePayload, getWhiteListURL, getTime } from './services/tool';
import * as cors from 'cors';
admin.initializeApp();
import { WriteConversation } from './services/conversations';
import { AddParticipantToConversation } from './services/participants';

const corsHandler = cors({ origin: getWhiteListURL(), methods: 'GET' });

const _db = admin.firestore();
const userRef = _db.collection('users');

export const aaHelloWorld = functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
        try {
            const timestamp : number = getTime();
            console.log(timestamp);
            res.send('HELLO WORLD');
        } catch (error) {
            res.status(500).send(error);
        }
    });
})

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


export const createConversation = functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
        const ownerId: string = req.query.ownerId;
        const userId: string = req.query.userId;
        WriteConversation(ownerId, userId).then((conversationId: string) => {
            AddParticipantToConversation(ownerId, conversationId, userId).then(() => {
                res.send(conversationId);
            }).catch(e => {
                res.status(500).send('HATA 1');
            })
        }).catch(er => {
            res.status(500).send('HATA 2');
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
                            .collection('conversations').doc(part.conversationId).set(Object.assign({}, conversation))
                    }
                    await userRef.doc(part.user.userId)
                        .collection('conversations').doc(part.conversationId).collection('participants').doc(participant.participantId).set(Object.assign({}, participant))
                });
            }).catch(e => {
                console.log(e);
            })
    }
})