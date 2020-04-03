import { Injectable } from '@angular/core';
import * as firebase from "firebase";
// import 'firebase/firestore';
import { ToolService } from '../../tool/tool.service';
import { CreateService } from '../../create/create.service';
import { User, UserModel, Device, Conversation, Participant, ConversationModel, Message, Settings, Avatar } from 'src/app/models/model';
import { AngularFirestore } from "angularfire2/firestore";

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  // firestore = firebase.firestore();
  // userRef = this.firestore.collection('users');
  userRef : any = firebase.firestore().collection('users');
  userModel: UserModel;
  constructor(
    private angularFirestore : AngularFirestore,
    private _create: CreateService,
    private _tool: ToolService) {
    }

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
    await this.userRef.doc(user.userId).set({
      userId: user.userId,
      firstname: user.firstname,
      lastname: user.lastname,
      email : user.email,
      creationTime: user.creationTime,
      devices : [],
      settings : {
        isPrivate : user.settings.isPrivate,
        darkTheme : user.settings.darkTheme,
        notify : user.settings.notify
      },
      isActive: true,
      isDeleted: false,
      deletedTime: null,

    });
    return user;
  }

  // SIGN IN
  // logIn(uId: string) {
  //   this.getUserByUserId(uId).then((user : User) => {
  //     if (localStorage.getItem('userModel') === undefined) {
  //       let userModel: UserModel = new UserModel(user, []);
  //       userModel.user = user
  //       localStorage.setItem('userModel', JSON.stringify(this.userModel));
  //     } else {
  //       let userModel: UserModel = JSON.parse(localStorage.getItem('userModel'));
  //       userModel.user = user
  //       localStorage.setItem('userModel', JSON.stringify(this.userModel));
  //     }
  //   }).catch(e => {
  //     //ERROR
  //   });
  //   // .onSnapshot(snap => {
  //   //   console.log(snap.data());
  //   //   if (localStorage.getItem('userModel') === undefined) {
  //   //     let userModel : UserModel = new UserModel(snap.data() as User,[]);
  //   //     userModel.user = snap.data() as User;
  //   //     localStorage.setItem('userModel',JSON.stringify(this.userModel));
  //   //   }else{
  //   //     let userModel : UserModel = JSON.parse(localStorage.getItem('userModel'));
  //   //     userModel.user = snap.data() as User;
  //   //     localStorage.setItem('userModel',JSON.stringify(this.userModel));
  //   //   }
  //   // })
  // }

  getUserByUserId(uId: string): Promise<User | any> {
    return new Promise((res, rej) => {
      this.userRef.doc(uId).get().then((u: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>) => {
        res(u.data() as User);
      }).catch(e => {
        rej(e);
      });
    })
  }

  // updateUserByUserId() {
  //   const settings: Settings = new Settings(true, false);
  //   const u: User = new User('llMP38HkC2UEqHD1zu5GojDDmWd2', 'Toprak', 'Erzurumluoğlu', "toprakerzurumluoglu@hotmail.com", 1584806583788, [], settings, true, true, false, null);
  //   // {"creationTime":1584806583788,"deletedTime":null,"devices":[],"email":"toprakerzurumluoglu@hotmail.com","firstname":"Toprak","isActive":true,"isDeleted":false,"isPrivate":false,"lastname":"Erzurumluoğlu","userId":"llMP38HkC2UEqHD1zu5GojDDmWd2"}
  //   this.userRef.doc('llMP38HkC2UEqHD1zu5GojDDmWd2').set(Object.assign({}, {
  //     "creationTime": 1584806583788,
  //     "deletedTime": null,
  //     "devices": [],
  //     "email": "toprakerzurumluoglu@hotmail.com",
  //     "firstname": "Toprak",
  //     "isActive": true,
  //     "isDeleted": false,
  //     "isPrivate": false,
  //     "settings": {
  //       'alert': false,
  //       'darkTheme': true
  //     },
  //     "lastname": "Erzurumluoğlu",
  //     "userId": "llMP38HkC2UEqHD1zu5GojDDmWd2"
  //   }));
  // }

  updateUserDataByUserId(uid : string,key : string,value : any) {
    return this.userRef.doc(uid).update(key,value);
  }

  addDevice(uid: string, token: string) {
    this.userRef.doc(uid).update(
      {
        devices: firebase.firestore.FieldValue.arrayUnion({ token: token })
      }
    );
  }

  addAvatar(uid : string,file: File,fileName: string, contentType: string,downloadURL: string) {
    let data: Avatar = this._create.createAvatarData(fileName,contentType,file.size,downloadURL);
    return this.updateUserDataByUserId(uid,'avatar',(Object.assign({},data)));
  }


  // GET ALL OTHER USER
  async getAllUsers(userId: string) {
    let users: User[] = await this.getCollectionData(this.userRef);
    let cu: number = users.indexOf(users.find(p => p.userId == userId));
    users.splice(cu, 1);
    return users;
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
        element.participantId = partKey;
        partRef.doc(partKey).set(Object.assign({}, element));
      });
    }
    return datas[0];
  }

  getUser(userId : string){
    return this.angularFirestore.collection('users').doc(userId);
  }

  getConversations(userId: string) {
    return this.angularFirestore.collection('users').doc(userId).collection('conversations');
  }

  getParticipants(userId: string, conversationId: string) {
    return this.angularFirestore.collection('users').doc(userId).collection('conversations').doc(conversationId).collection('participants');
  }

  getMessages(userId: string, conversationId: string) {
    return this.angularFirestore.collection('users').doc(userId).collection('conversations').doc(conversationId).collection('messages',ref => ref.orderBy('createdTime', 'asc'));
  }

  sendMessage(messageContent: string, conversation: ConversationModel, sender: User, receiver: User) {
    const message: Message = this._create.createMessageData(messageContent, sender, conversation.conversation.conversationId, null, null);
    var senderMessageRef = this.userRef.doc(sender.userId).collection('conversations').doc(conversation.conversation.conversationId).collection('messages');
    var receiverMessageRef = this.userRef.doc(receiver.userId).collection('conversations').doc(conversation.conversation.conversationId).collection('messages');
    const key: string = senderMessageRef.doc().id;
    message.messageId = key;
    return Promise.all([senderMessageRef.doc(key).set(Object.assign({}, message)), receiverMessageRef.doc(key).set(Object.assign({}, message))]);
  }
}
