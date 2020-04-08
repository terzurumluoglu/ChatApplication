import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Message, Device } from './model';
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

function findRepeatingElement(array: Device[]) : any[][] {
    const temp : any = {};
    const indexes : any[] = [];
    const lastTokens : any[] = [];
    for (let i = 0; i < array.length; i++){
        if (temp[array[i].token]) {
            indexes.push(i);
        }
        temp[array[i].token] = true;
    }
    temp.forEach((k : any) => {
        lastTokens.push(array.find(f => f.token === k));
    });
    return [lastTokens, indexes];
}

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
        const allTokens: Device[] = getTokenPromises.docs.map((doc: any) => doc.data());

        const array = findRepeatingElement(allTokens);
        const deviceTokens = array[0] as Device[];

        const tokens = deviceTokens.map(p => p.token);

        const indexes = array[1] as number[];

        const tokensToRemove: any[] = [];
        indexes.forEach(element => {
            tokensToRemove.push(tokenRef.doc(allTokens[element].key).delete());
        });
        // console.log(tokens);
        // const keys: any[] = getTokenPromises.docs.map((doc: any) => doc.data().key);
        // console.log(keys);

        // Check if there are any device tokens.
        if (allTokens.length === 0) {
            console.log('There are no notification tokens to send to.');
            return 'There are no notification tokens to send to.';
        }

        const payload = {
            notification: {
                title: 'Chat Application',
                body: messageData !== undefined ? messageData.messageContent : 'Boş Mesaj',
                icon: messageData.sender?.avatar?.downloadURL || 'https://toprakchatapplication.firebaseapp.com/assets/dist/media/img/empty-avatar.png'
            }
        };

        // Send notifications to all tokens.
        if (userId === messageData.sender.userId) {
            console.log('Mesaj sahibine bildirim gitmez!');
            return 'Owner!';
        }
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
            console.log(tokensToRemove.length);
        });
        return Promise.all(tokensToRemove);
    });

    // _db.collection('users').doc(userId).get().then((u) => {
    //     const user = u.data() as User;
    //     return admin.messaging().sendToDevice(user.device,payload)
    // }).catch(e => {
    //     console.log('HATA');
    // });