import { Conversation, User, Participant } from "../model/model";
import { GetUserByUserId } from "./getList";
import { getTime } from "./tool";

export const createConversationData = function(conversationId : string,userId: string) : Promise<Conversation> {
    const creationTime: number = getTime();
    return new Promise((res,rej) => {
      GetUserByUserId(userId).then((owner : User) => {
        res(new Conversation(conversationId, creationTime, owner, false, false));
      }).catch(e => {
        rej(e);
      })
    });
  }

export const createParticipantData = async function(conversationId: string,participantId : string, userId: string) : Promise<Participant> {
  const creationTime: number = getTime();
  return new Promise((res,rej) => {
    GetUserByUserId(userId).then((user : User) => {
      res(new Participant(participantId,conversationId,1,creationTime,user));
    }).catch(e => {
      rej(e);
    })
  });
}