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

  addDevice(uid: string, token: string) {
    this.userRef.doc(uid).update(
      {
        devices: firebase.firestore.FieldValue.arrayUnion({ token: token })
      }
    );
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
    let conKey = senderConRef.doc().id;
    for (let i = 0; i < datas.length; i++) {
      let conRef = refS[i];
      datas[i].conversation.conversationId = conKey;
      conRef.doc(conKey).set(Object.assign({}, datas[i].conversation));
      datas[i].participants.forEach(element => {
        let partRef = conRef.doc(conKey).collection('participants');
        let partKey = partRef.doc().id;
        element.conversationId = conKey;
        element.participantId = partKey;
        partRef.doc(partKey).set(Object.assign({}, element));
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
    return this.angularFirestore.collection('users').doc(userId).collection('conversations',ref=> ref.where('isDeleted','==',false).where('isActive','==',true));
  }

  // delete(userId: string){
  //   this.getConversations(userId).get().subscribe(p => {
  //     this.angularFirestore.collection('users').doc(userId).collection('conversations').doc(p.docs[0].id).delete();
  //   });
  // }

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
