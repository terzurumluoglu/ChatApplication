import { Injectable } from '@angular/core';
import * as firebase from "firebase";
import 'firebase/firestore';
import { ToolService } from '../../tool/tool.service';
import { CreateService } from '../../create/create.service';
import { User, UserModel, Device, Conversation, Participant, ConversationModel, Message } from 'src/app/models/model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  firestore = firebase.firestore();
  userRef = this.firestore.collection('users');
  userModel: UserModel;
  constructor(
    private _create: CreateService,
    private _tool: ToolService) { }

  async getCollectionData(collection: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>, paramName?: string, param?: any) {
    let snapshot: any;
    if (param) {
      snapshot = await collection.where(paramName, '==', param).get();
    } else {
      snapshot = await collection.get();
    }
    return snapshot.docs.map((doc: any) => doc.data());
  }

  // REGISTER
  async addUser(firstname: string, lastname: string, credential: firebase.auth.UserCredential) {
    const user: User = this._create.createUserData(firstname, lastname, credential);
    let datas: any[] = [
      this.userRef.doc(user.userId).set(Object.assign({}, user))
    ];
    await Promise.all(datas);
    return user;
  }

  // SIGN IN
  logIn(uId: string): Promise<User | any> {
    return this.getUserByUserId(uId);
  }

  getUserByUserId(uId: string): Promise<User | any> {
    return new Promise((res, rej) => {
      this.userRef.doc(uId).get().then((u: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>) => {
        res(u.data() as User);
      }).catch(e => {
        rej(e);
      });
    })
  }

  // GET ALL OTHER USER
  async getAllUsers(userId: string) {
    let users: User[] = await this.getCollectionData(this.userRef);
    let cu: number = users.indexOf(users.find(p => p.userId == userId));
    users.splice(cu, 1);
    return users;
  }

  startConversation(sender: User, receiver: User) : ConversationModel {
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
        element.participantId = partKey;
        partRef.doc(partKey).set(Object.assign({}, element));
      });
    }
    return datas[0];
  }

  getConversations(user: User): firebase.firestore.CollectionReference<firebase.firestore.DocumentData> {
    return this.userRef.doc(user.userId).collection('conversations');
  }

  getParticipants(user: User, conversationId: string) : firebase.firestore.CollectionReference<firebase.firestore.DocumentData> {
    return this.userRef.doc(user.userId).collection('conversations').doc(conversationId).collection('participants');
  }

  getMessages(user: User, conversationId: string) : firebase.firestore.Query<firebase.firestore.DocumentData>{
      return this.userRef.doc(user.userId).collection('conversations').doc(conversationId).collection('messages').orderBy('createdTime','asc');
  }

  sendMessage(messageContent : string,conversation : ConversationModel,sender : User,receiver : User){
    const message : Message = this._create.createMessageData(messageContent,sender,conversation.conversation.conversationId,null,null);
    var senderMessageRef = this.userRef.doc(sender.userId).collection('conversations').doc(conversation.conversation.conversationId).collection('messages');
    var receiverMessageRef = this.userRef.doc(receiver.userId).collection('conversations').doc(conversation.conversation.conversationId).collection('messages');
    const key: string = senderMessageRef.doc().id;
    message.messageId = key;
    return Promise.all([senderMessageRef.doc(key).set(Object.assign({}, message)), receiverMessageRef.doc(key).set(Object.assign({}, message))]);
  }
}
