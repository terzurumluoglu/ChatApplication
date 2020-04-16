import { Conversation, User, Participant, Message } from "../model/model";
import { GetUserByUserId } from "./getList";
import { getTime } from "./tool";

export const createConversationData = function(conversationId : string,userId: string) : Promise<Conversation> {
    const creationTime: number = getTime();
    return new Promise((res,rej) => {
      GetUserByUserId(userId).then((owner : User) => {
        res(new Conversation(conversationId, creationTime, owner, true, false));
      }).catch(e => {
        rej(e);
      })
    });
  }

export const createParticipantData = function(conversationId: string,participantId : string, userId: string) : Promise<Participant> {
  const creationTime: number = getTime();
  return new Promise((res,rej) => {
    GetUserByUserId(userId).then((user : User) => {
      res(new Participant(participantId,conversationId,1,creationTime,user));
    }).catch(e => {
      rej(e);
    })
  });
}

export const createMessageData = function(messageId : string,ownerId: string, conversationId : string,messageContent : string,type : number) : Promise<Message>{
  const creationTime : number = getTime();
  return new Promise((res,rej) => {
    GetUserByUserId(ownerId).then((owner : User) => {
      console.log(owner);
      res(new Message(messageId,type,messageContent,owner,conversationId,creationTime,true,false,false,false));
    }).catch(e => {
      rej(e);
    })
  });
}