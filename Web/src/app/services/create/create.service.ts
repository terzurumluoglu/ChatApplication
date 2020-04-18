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
    let user : User = new User(userId,fn,email,creationTime,settings,true,false,avatar,null);
    return user;
  }

  createAvatarData(fileName : string,contentType : string, size : number,downloadUrl ?: string) : Avatar{
    const avatar : Avatar = new Avatar(fileName,contentType,size,true,false,null,downloadUrl);
    return avatar;
  }

  createConversationData(conversationId : string,user: User) : Conversation {
    let creationTime: number = this._tool.getTime();
    let conversation: Conversation = new Conversation(conversationId, creationTime, user,false,false);
    return conversation;
  }

  createConversationModelData(conversation : Conversation, participants : Participant[],messages : Message[]){
    let conversationModel : ConversationModel = new ConversationModel(conversation,participants,messages);
    return conversationModel;
  }

  createMessageData(messageContent : string,owner : User,conversationId : string,attachmentUrl : string,attachmentThumbUrl : string){
    const creationTime : number = this._tool.getTime();
    const message : Message = new Message(null,1,messageContent,owner,conversationId,attachmentUrl,attachmentThumbUrl,creationTime,true,false,false,false);
    return message;
  }

}
