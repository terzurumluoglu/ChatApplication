
import { Device, Message } from '../model/model';
import * as admin from 'firebase-admin';

// Bu metot user ın bütün device tokenlarını alır çoklanmış olanların tekilleştirir ve diğerlerinin indexlerini silinmek üzere ayırır.
export const findRepeatingElement = function (array: Device[]): any[][] {
    const temp: any = {};
    const deleteTokensIndexes: any[] = [];
    const inUseTokens: any[] = [];
    for (let i = 0; i < array.length; i++) {
        if (temp[array[i].token]) {
            deleteTokensIndexes.push(i);
        }
        temp[array[i].token] = true;
    }
    for (const k in temp) {
        inUseTokens.push(array.find(f => f.token === k));
    }
    return [inUseTokens, deleteTokensIndexes];
}

export const createNotificationMessagePayload = function (messageData: Message): admin.messaging.MessagingPayload {
    return {
        notification: {
            title: 'Chat Application',
            body: messageData !== undefined ? messageData.messageContent : 'Boş Mesaj',
            icon: messageData.sender?.avatar?.downloadURL || 'https://toprakchatapplication.firebaseapp.com/assets/dist/media/img/empty-avatar.png',
            clickAction: 'https://toprakchatapplication.firebaseapp.com/conversation',
            // color : '#249c06',
            // image : 'https://randomuser.me/api/portraits/women/57.jpg'
        }
    }
}