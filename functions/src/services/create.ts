import { Conversation, User, Participant } from "../model/model";
import { GetUserByUserId, getTime } from "./getList";

export const createConversationData = async function(conversationId : string,userId: string) : Promise<Conversation> {
    const creationTime: number = getTime();
    
    const owner : User = await GetUserByUserId(userId);
    return new Conversation(conversationId, creationTime, owner, false, false);
  }

export const createParticipantData = async function(conversationId: string,participantId : string, userId: string) : Promise<Participant> {
  const creationTime: number = getTime();
  const user : User = await GetUserByUserId(userId);
  return new Participant(participantId,conversationId,1,creationTime,user);
}