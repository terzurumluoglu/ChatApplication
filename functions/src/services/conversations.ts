import admin = require("firebase-admin");
import { Conversation, Participant } from "../model/model";
import { createConversationData, createParticipantData } from "./create";

const _db = admin.firestore();
const userRef = _db.collection('users');

export const WriteConversation = function (ownerId: string, userId: string): Promise<string> {
    const ownerConversationRef = userRef.doc(ownerId).collection('conversations');
    const conversationId: string = ownerConversationRef.doc().id;
    const participantRef = ownerConversationRef.doc(conversationId).collection('participants');
    const participantId: string = participantRef.doc().id;
    return new Promise((res, rej) => {
        createConversationData(conversationId, ownerId).then((conversation: Conversation) => {
            createParticipantData(conversationId, participantId, ownerId).then((participant: Participant) => {
                ownerConversationRef.doc(conversationId).set({
                    conversationId: conversation.conversationId,
                    createdTime: conversation.createdTime,
                    isActive: conversation.isActive,
                    isDeleted: conversation.isDeleted,
                    owner: {
                        userId: conversation.owner.userId,
                        email: conversation.owner.email,
                        avatar: conversation.owner.avatar === null ? null : {
                            avatarName: conversation.owner.avatar.avatarName,
                            contentType: conversation.owner.avatar.contentType,
                            deletedTime: conversation.owner.avatar.deletedTime,
                            isActive: conversation.owner.avatar.isActive,
                            isDeleted: conversation.owner.avatar.isDeleted,
                            size: conversation.owner.avatar.size,
                            downloadURL: conversation.owner.avatar.downloadURL
                        },
                        displayName: conversation.owner.displayName,
                        bio: conversation.owner.bio,
                        creationTime: conversation.owner.creationTime,
                        isActive: conversation.owner.isActive,
                        isDeleted: conversation.owner.isDeleted,
                        settings: {
                            darkTheme: conversation.owner.settings.darkTheme,
                            isPrivate: conversation.owner.settings.isPrivate,
                            notify: conversation.owner.settings.notify
                        },
                        deletedTime: conversation.owner.deletedTime
                    }
                }).then(() => {
                    participantRef.doc(participantId).set({
                        participantId: participant.participantId,
                        conversationId: participant.conversationId,
                        creationTime: participant.creationTime,
                        type: participant.type,
                        user: {
                            userId: participant.user.userId,
                            avatar: participant.user.avatar === null ? null : {
                                avatarName: participant.user.avatar.avatarName,
                                contentType: participant.user.avatar.contentType,
                                deletedTime: participant.user.avatar.deletedTime,
                                isActive: participant.user.avatar.isActive,
                                isDeleted: participant.user.avatar.isDeleted,
                                size: participant.user.avatar.size,
                                downloadURL: participant.user.avatar.downloadURL,
                            },
                            bio: participant.user.bio,
                            creationTime: participant.user.creationTime,
                            displayName: participant.user.displayName,
                            email: participant.user.email,
                            isActive: participant.user.isActive,
                            isDeleted: participant.user.isDeleted,
                            settings: {
                                darkTheme: participant.user.settings.darkTheme,
                                isPrivate: participant.user.settings.isPrivate,
                                notify: participant.user.settings.notify
                            },
                            deletedTime: participant.user.deletedTime
                        }
                    }).then(() => {
                        res(conversationId);
                    }).catch(e => {
                        rej(e);
                    })
                }).catch(e => {
                    rej(e);
                });
            }).catch(e => {
                rej(e);
            });
        }).catch(e => {
            rej(e);
        })
    });
}

// export const statusConversation = function (ownerId : string,conversationId : string):Promise<boolean>{
//     return new Promise((res) => {
//         userRef.doc(ownerId).collection('conversations').doc(conversationId).get().then(p => {
//             const con : Conversation = p.data() as Conversation;
//             res(con.isActive);
//         }).catch(() => {
//             res(false);
//         })
//     })
// }

export const ActivateConversation = async function (ownerId: string, conversationId: string) {
    await userRef.doc(ownerId).collection('conversations').doc(conversationId).update('isActive', true);
}

export const DeActivateConversation = async function (ownerId: string, conversationId: string) {
    await userRef.doc(ownerId).collection('conversations').doc(conversationId).update('isActive', false);
}