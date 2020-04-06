import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();
const _db = admin.firestore();
const userRef = _db.collection('users');
export const updateMessageAsRead = functions.firestore.document('users/{userId}/conversations/{conversationId}/messages/{messageId}').onWrite(async (snapshot,context) => {
    userRef.doc(context.params.userId)
    .collection('conversations').doc(context.params.conversationId)
    .collection('messages').doc(context.params.messageId).update('isSended',true).then(() => {
        console.log('Başarılı');
    }).catch(e => {
        console.log(e);
        console.log('HATA');
    });
    console.log(snapshot);
    console.log(context);
    console.log(context.params);
});