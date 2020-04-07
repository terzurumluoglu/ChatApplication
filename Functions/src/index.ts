import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Message } from './model';
admin.initializeApp();
const _db = admin.firestore();
const userRef = _db.collection('users');
export const updateMessageAsRead = functions.firestore.document('users/{userId}/conversations/{conversationId}/messages/{messageId}').onWrite(async (snapshot, context) => {
    userRef.doc(context.params.userId)
        .collection('conversations').doc(context.params.conversationId)
        .collection('messages').doc(context.params.messageId).update('isSended', true).then(() => {
            console.log('Başarılı');
        }).catch(e => {
            console.log(e);
            console.log('HATA');
        });
    console.log(snapshot);
    console.log(context);
    console.log(context.params);
});

export const inComingMessageNotification = functions.firestore
    .document('users/{userId}/conversations/{conversationId}/messages/{messageId}')
    .onCreate(async (snap, context) => {

        const messageData = snap.data() as Message;
        const userId: string = context.params.userId as string;

        // console.log(messageData);
        // Push İçin Mesaj bilgileri ile Push Datası Oluşturma
        const tokenRef = _db.collection('users').doc(userId).collection('devices');
        const getTokenPromises = await tokenRef.get();

        // The array containing all the user's tokens.
        const tokens: any[] = getTokenPromises.docs.map((doc: any) => doc.data().token);
        console.log(tokens);
        const keys: any[] = getTokenPromises.docs.map((doc: any) => doc.data().key);
        console.log(keys);

        // Check if there are any device tokens.
        if (getTokenPromises.size === 0) {
            console.log('There are no notification tokens to send to.');
            return 'There are no notification tokens to send to.';
        }

        const payload = {
            notification: {
                title: 'Chat Application',
                body: messageData !== undefined ? messageData.messageContent : 'Boş Mesaj',
                icon: messageData.sender?.avatar?.downloadURL || 'https://randomuser.me/api/portraits/men/49.jpg'
            }
        };

        // Send notifications to all tokens.
        if (userId === messageData.sender.userId) {
            console.log('Mesaj sahibine bildirim gitmez!');
            return 'Owner!';
        }
        const response = await admin.messaging().sendToDevice(tokens, payload);
        // For each message check if there was an error.
        const tokensToRemove: any[] = [];
        response.results.forEach((result, index) => {
            const error = result.error;
            if (error) {
                console.error('Failure sending notification to', tokens[index], error);
                // Cleanup the tokens who are not registered anymore.
                if (error.code === 'messaging/invalid-registration-token' ||
                    error.code === 'messaging/registration-token-not-registered') {
                    tokensToRemove.push(tokenRef.doc(keys[index]).delete());
                }
            }
        });
        return Promise.all(tokensToRemove);
    });

    // _db.collection('users').doc(userId).get().then((u) => {
    //     const user = u.data() as User;
    //     return admin.messaging().sendToDevice(user.device,payload)
    // }).catch(e => {
    //     console.log('HATA');
    // });