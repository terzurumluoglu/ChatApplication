import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Message, Device } from './model/model';
import { findRepeatingElement, createNotificationMessagePayload } from './services/tool';
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