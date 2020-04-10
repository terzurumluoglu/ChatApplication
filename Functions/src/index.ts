import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Message, Device } from './model/model';
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

// Bu metot user ın bütün device tokenlarını alır çoklanmış olanların tekilleştirir ve diğerlerinin indexlerini silinmek üzere ayırır.
function findRepeatingElement(array: Device[]) : any[][] {
    const temp : any = {};
    const deleteTokensIndexes : any[] = [];
    const inUseTokens : any[] = [];
    for (let i = 0; i < array.length; i++){
        if (temp[array[i].token]) {
            deleteTokensIndexes.push(i);
        }
        temp[array[i].token] = true;
    }
    for (const k in temp){
        inUseTokens.push(array.find(f => f.token === k));
    }
    return [inUseTokens, deleteTokensIndexes];
}

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
        const notification : admin.messaging.NotificationMessagePayload = {
            title: 'Chat Application',
            body: messageData !== undefined ? messageData.messageContent : 'Boş Mesaj',
            icon: messageData.sender?.avatar?.downloadURL || 'https://toprakchatapplication.firebaseapp.com/assets/dist/media/img/empty-avatar.png',
            clickAction : 'https://toprakchatapplication.firebaseapp.com/conversation',
            // color : '#249c06',
            // image : 'https://randomuser.me/api/portraits/women/57.jpg'
        }

        const payload : admin.messaging.MessagingPayload = {
            notification: notification
        };

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