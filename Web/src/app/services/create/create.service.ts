import { Injectable } from '@angular/core';
import { ToolService } from '../tool/tool.service';
import { User, UserModel, Conversation, Participant, ConversationModel, Message, Settings, Device, Avatar } from 'src/app/models/model';

@Injectable({
  providedIn: 'root'
})
export class CreateService {

  constructor(private _tool: ToolService) { }

  createSettingData(theme : boolean,alert : boolean,isPrivate : boolean){
    return new Settings(theme,alert,isPrivate);
  }

  createUserData(firstname: string, lastname: string, userCredential: firebase.auth.UserCredential): User {
    const settings : Settings = this.createSettingData(false,true,true);
    let userId: string = userCredential.user.uid;
    let email : string = userCredential.user.email;
    let creationTime: number = parseInt(userCredential.user.metadata['b']);
    let user: User = new User(userId, firstname, lastname,email, creationTime, [], settings, true, false, null,null,null);
    return user;
  }

  createAvatarData(fileName : string,contentType : string, size : number,downloadUrl ?: string) : Avatar{
    const avatar : Avatar = new Avatar(fileName,contentType,size,true,false,null,downloadUrl);
    return avatar;
    // return {
    //   avatarName : fileName,
    //   contentType : contentType,
    //   size : size,
    //   isActive : true,
    //   isDeleted : false,
    //   deletedTime : null,
    //   downloadURL : downloadUrl
    // }
  }

  createConversationData(conversationId : string,sender: User) : Conversation {
    let creationTime: number = this._tool.getTime();
    let conversation: Conversation = new Conversation(conversationId, creationTime, sender, null, false, false, null);
    return conversation;
  }

  createParticipantData(conversationId: string,participantId : string, user: User) : Participant {
    let creationTime: number = this._tool.getTime();
    let participant: Participant = new Participant(participantId,conversationId,false,1,creationTime,user);
    return participant;
  }

  createConversationModelData(conversation : Conversation, participants : Participant[],messages : Message[]){
    let conversationModel : ConversationModel = new ConversationModel(conversation,participants,messages);
    return conversationModel;
  }

  createMessageData(messageContent : string,sender : User,conversationId : string,attachmentUrl : string,attachmentThumbUrl : string){
    const creationTime : number = this._tool.getTime();
    const message : Message = new Message(null,1,messageContent,sender,conversationId,attachmentUrl,attachmentThumbUrl,creationTime,null,true,false,false,false);
    return message;
  }

  
  createConversation(sender: User, receiver: User): ConversationModel[] {
    const con1: Conversation = this.createConversationData(null, sender);
    const part11: Participant = this.createParticipantData(con1.conversationId, null, sender);
    const part12: Participant = this.createParticipantData(con1.conversationId, null, receiver);
    const conModel1: ConversationModel = this.createConversationModelData(con1, [part11, part12], []);
    const con2: Conversation = this.createConversationData(null, receiver);
    const part21: Participant = this.createParticipantData(con2.conversationId, null, sender);
    const part22: Participant = this.createParticipantData(con2.conversationId, null, receiver);
    const conModel2: ConversationModel = this.createConversationModelData(con2, [part21, part22], []);

    return [conModel1, conModel2];
  }

}
