import { Injectable } from '@angular/core';
import * as firebase from "firebase/app";
import 'firebase/firestore';
import { ToolService } from '../../tool/tool.service';
import { CreateService } from '../../create/create.service';
import { User, UserModel, Device, Conversation, Participant, ConversationModel, Message, Settings, Avatar } from 'src/app/models/model';
import { AngularFirestore } from "angularfire2/firestore";

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  firestore = firebase.firestore();
  userRef = this.firestore.collection('users');
  // userRef : any = firebase.firestore().collection('users');
  userModel: UserModel;
  constructor(
    private angularFirestore: AngularFirestore,
    private _create: CreateService,
    private _tool: ToolService) {
  }


  // REGISTER
  async addUser(firstname: string, lastname: string, credential: firebase.auth.UserCredential) {
    const user: User = this._create.createUserData(firstname, lastname, credential);
    await this.userRef.doc(user.userId).set({
      userId: user.userId,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      creationTime: user.creationTime,
      devices: [],
      settings: {
        isPrivate: user.settings.isPrivate,
        darkTheme: user.settings.darkTheme,
        notify: user.settings.notify
      },
      isActive: true,
      isDeleted: false,
      deletedTime: null,

    });
    return user;
  }

  updateUserDataByUserId(uid: string, key: string, value: any) {
    return this.userRef.doc(uid).update(key, value);
  }

  changeParticipantStatus(conversation : ConversationModel, userId: string, status : string){
    const conId : string = conversation.conversation.conversationId;
    const partId : string = conversation.participants.find(f => f.user.userId == userId).participantId;
    conversation.participants.forEach(element => {
      this.userRef.doc(element.user.userId)
      .collection('conversations').doc(conId)
      .collection('participants').doc(partId).update({status : status});
    });
  }

  addDevice(uid: string, token: string) {
    const deviceRef = this.userRef.doc(uid).collection('devices');
    const deviceRefKey : string = deviceRef.doc().id;
    deviceRef.doc(deviceRefKey).set({key : deviceRefKey,token : token});
  }

  addAvatar(uid: string, file: File, fileName: string, contentType: string, downloadURL: string) {
    let data: Avatar = this._create.createAvatarData(fileName, contentType, file.size, downloadURL);
    return this.updateUserDataByUserId(uid, 'avatar', (Object.assign({}, data)));
  }

  startConversation(sender: User, receiver: User): ConversationModel {
    const datas: ConversationModel[] = this._create.createConversation(sender, receiver);
    let senderConRef = this.userRef.doc(sender.userId).collection('conversations');
    let receiverConRef = this.userRef.doc(receiver.userId).collection('conversations');
    const refS: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>[] = [senderConRef, receiverConRef];
    for (let i = 0; i < datas.length; i++) {
      let conRef = refS[i];
      conRef.doc(datas[i].conversation.conversationId).set(Object.assign({}, datas[i].conversation));
      datas[i].participants.forEach(element => {
        let partRef = conRef.doc(datas[i].conversation.conversationId).collection('participants');
        partRef.doc(element.participantId).set(Object.assign({}, element));
      });
    }
    return datas[0];
  }

  getUser(userId: string) {
    return this.angularFirestore.collection('users').doc(userId);
  }

  getAllUsers(){
    return this.angularFirestore.collection('users');
  }

  getConversations(userId: string) {
    return this.angularFirestore.collection('users').doc(userId).collection('conversations',ref=> ref.where('isDeleted','==',false));
  }

  // delete(userId: string){
  //   this.getConversations(userId).get().subscribe(p => {
  //     this.angularFirestore.collection('users').doc(userId).collection('conversations').doc(p.docs[0].id).delete();
  //   });
  // }

  readMessage(conversationId : string,messages: Message[],participants :  Participant[]) {
    for (let i = 0; i < participants.length; i++) {
      for (let j = 0; j < messages.length; j++) {
        console.log(participants[i].user.userId + '/' + conversationId + '/' + messages[j].messageId);
        this.userRef.doc(participants[i].user.userId)
        .collection('conversations').doc(conversationId)
        .collection('messages').doc(messages[j].messageId).update('isRead',true);
      }
    }
  }

  getParticipants(userId: string, conversationId: string) {
    return this.angularFirestore.collection('users').doc(userId).collection('conversations').doc(conversationId).collection('participants');
  }

  getMessages(userId: string, conversationId: string) {
    return this.angularFirestore.collection('users').doc(userId).collection('conversations').doc(conversationId).collection('messages', ref => ref.orderBy('createdTime', 'asc'));
  }

  updateConversationDataByConversationId(uid: string, conversationId: string, key: string, value: any) {
    return this.userRef.doc(uid).collection('conversations').doc(conversationId).update(key, value);
  }

  sendMessage(messageContent: string, conversation: ConversationModel, sender: User, receiver: User) {
    const message: Message = this._create.createMessageData(messageContent, sender, conversation.conversation.conversationId, null, null);
    if (conversation.conversation.isActive === false) {
      this.updateConversationDataByConversationId(sender.userId, conversation.conversation.conversationId, 'isActive', true);
      this.updateConversationDataByConversationId(receiver.userId, conversation.conversation.conversationId, 'isActive', true);
    }
    var senderMessageRef = this.userRef.doc(sender.userId).collection('conversations').doc(conversation.conversation.conversationId).collection('messages');
    var receiverMessageRef = this.userRef.doc(receiver.userId).collection('conversations').doc(conversation.conversation.conversationId).collection('messages');
    const key: string = senderMessageRef.doc().id;
    message.messageId = key;
    return Promise.all([senderMessageRef.doc(key).set(Object.assign({}, message)), receiverMessageRef.doc(key).set(Object.assign({}, message))]);
  }
}
