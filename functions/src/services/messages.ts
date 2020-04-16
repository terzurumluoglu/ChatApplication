import admin = require("firebase-admin");
import { createMessageData } from "./create";
import { Message } from "../model/model";

const _db = admin.firestore();
const userRef = _db.collection('users');

export const writeMessage = async function (ownerId: string, conversationId: string, messageContent: string, type: number): Promise<boolean | any> {
    const conversationDoc = userRef.doc(ownerId).collection('conversations').doc(conversationId);
    const messageRef = conversationDoc.collection('messages');
    
    const messageId: string = messageRef.doc().id;
    return new Promise((res, rej) => {
        createMessageData(messageId, ownerId, conversationId, messageContent, type).then((message: Message) => {
            console.log(message);
            messageRef.doc(messageId).set({
                conversationId: conversationId,
                createdTime: message.createdTime,
                isActive: message.isActive,
                isDeleted: message.isDeleted,
                isRead: message.isRead,
                isSended: message.isSended,
                messageContent: message.messageContent,
                messageId: message.messageId,
                messageType: message.messageType,
                owner: {
                    userId: message.owner.userId,
                    email: message.owner.email,
                    avatar: message.owner.avatar === null ? null : {
                        avatarName: message.owner.avatar.avatarName,
                        contentType: message.owner.avatar.contentType,
                        deletedTime: message.owner.avatar.deletedTime,
                        isActive: message.owner.avatar.isActive,
                        isDeleted: message.owner.avatar.isDeleted,
                        size: message.owner.avatar.size,
                        downloadURL: message.owner.avatar.downloadURL
                    },
                    displayName: message.owner.displayName,
                    bio: message.owner.bio,
                    creationTime: message.owner.creationTime,
                    isActive: message.owner.isActive,
                    isDeleted: message.owner.isDeleted,
                    settings: {
                        darkTheme: message.owner.settings.darkTheme,
                        isPrivate: message.owner.settings.isPrivate,
                        notify: message.owner.settings.notify
                    },
                    deletedTime: message.owner.deletedTime
                },
                attachmentThumbUrl: message.attachmentThumbUrl ? message.attachmentThumbUrl : null,
                attachmentUrl: message.attachmentUrl ? message.attachmentUrl : null,
                deletedTime: message.deletedTime ? message.deletedTime : null,
            }).then(() => {
                console.log(true);
                res(true);
            }).catch(e => {
                console.log(1);
                console.log(e);
                rej(e);
            });
        }).catch(e => {
            console.log(2);
            console.log(e);
            rej(e);
        })
    });
}