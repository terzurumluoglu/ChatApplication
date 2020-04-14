import { Injectable } from '@angular/core';
import { ToolService } from '../tool/tool.service';
import { User, Conversation, Participant, ConversationModel, Message, Settings, Avatar } from 'src/app/models/model';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class CreateService {

  firestore = firebase.firestore();
  constructor(
    private _tool: ToolService) { }

  createSettingData(theme : boolean,alert : boolean,isPrivate : boolean){
    return new Settings(theme,alert,isPrivate);
  }

  createUserData(userCredential: firebase.auth.UserCredential,displayName ?: string): User {
    const settings : Settings = this.createSettingData(false,true,true);
    let userId: string = userCredential.user.uid;
    let email : string = userCredential.user.email;
    let creationTime: number = parseInt(userCredential.user.metadata['b']);
    let fn : string = userCredential.additionalUserInfo.providerId == 'password' ? displayName : userCredential.user.displayName;
    let avatar : Avatar = userCredential.additionalUserInfo.providerId == 'password' ? null : {
      avatarName : null,
      contentType : null,
      deletedTime : null,
      size : null,
      isActive : true,
      isDeleted : false,
      downloadURL : userCredential.user.photoURL
    };
    let user : User = new User(userId,fn,email,creationTime,settings,true,false,null,avatar,null);
    return user;
  }

  createAvatarData(fileName : string,contentType : string, size : number,downloadUrl ?: string) : Avatar{
    const avatar : Avatar = new Avatar(fileName,contentType,size,true,false,null,downloadUrl);
    return avatar;
  }

  createConversationData(conversationId : string,user: User) : Conversation {
    let creationTime: number = this._tool.getTime();
    let conversation: Conversation = new Conversation(conversationId, creationTime, user, null, false, false, null);
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
    let conversationId : string = this.firestore.collection('users').doc(sender.userId).collection('conversations').doc().id;
    const con: Conversation = this.createConversationData(conversationId, sender);
    const partKey1 : string = this.firestore.collection('users').doc(sender.userId).collection('conversations').doc(con.conversationId).collection('participants').doc().id;
    const partKey2 : string = this.firestore.collection('users').doc(receiver.userId).collection('conversations').doc(con.conversationId).collection('participants').doc().id;
    const part11: Participant = this.createParticipantData(con.conversationId, partKey1, sender);
    const part12: Participant = this.createParticipantData(con.conversationId, partKey2, receiver);
    const conModel1: ConversationModel = this.createConversationModelData(con, [part11, part12], []);
    const part21: Participant = this.createParticipantData(con.conversationId, partKey1, sender);
    const part22: Participant = this.createParticipantData(con.conversationId, partKey2, receiver);
    const conModel2: ConversationModel = this.createConversationModelData(con, [part21, part22], []);

    return [conModel1, conModel2];
  }

}
