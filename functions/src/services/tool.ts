
import { Message } from '../model/model';
import * as admin from 'firebase-admin';


export const createNotificationMessagePayload = function (messageData: Message): admin.messaging.MessagingPayload {
    return {
        notification: {
            title: 'Chat Application',
            body: messageData !== undefined ? messageData.messageContent : 'Boş Mesaj',
            icon: messageData.owner?.avatar?.downloadURL || 'https://toprakchatapplication.firebaseapp.com/assets/dist/media/img/empty-avatar.png',
            clickAction: 'https://toprakchatapplication.firebaseapp.com/conversation',
            // color : '#249c06',
            // image : 'https://randomuser.me/api/portraits/women/57.jpg'
        }
    }
}

export const getWhiteListURL = function (): string[] {
    return ['http://localhost:4200', 'http://localhost:4201'];
}

export const getTime = function (): number {
    const timestamp = admin.firestore.Timestamp.now();
    const timeNow: number = timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    return timeNow;
}