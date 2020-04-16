import admin = require("firebase-admin");
import { Participant } from "../model/model";
import { createParticipantData } from "./create";

const _db = admin.firestore();
const userRef = _db.collection('users');

export const AddParticipantToConversation = function (ownerId: string, conversationId: string, userId: string) {
    const participantRef = userRef.doc(ownerId).collection('conversations').doc(conversationId).collection('participants');
    const participantId: string = participantRef.doc().id;
    return new Promise((res, rej) => {
        createParticipantData(conversationId, participantId, userId).then((participant: Participant) => {
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
            }).then(p => {
                res(true);
            }).catch(e => {
                rej(e);
            })
        }).catch(e => {
            rej(e);
        });
    });
}
