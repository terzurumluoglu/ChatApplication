import { Injectable } from '@angular/core';
import * as firebase from "firebase/app";
import 'firebase/firestore';
import { ToolService } from '../../tool/tool.service';
import { CreateService } from '../../create/create.service';
import { User, UserModel, Device, Conversation, Participant, ConversationModel, Message, Settings, Avatar } from 'src/app/models/model';
import { AngularFirestore } from "angularfire2/firestore";
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  firestore = firebase.firestore();
  userRef = this.firestore.collection('users');
  
  userModel: UserModel;
  constructor(
    private afs: AngularFirestore,
    private _create: CreateService,
    private _tool: ToolService) {
  }

  deleteConversationAndParticipant(){
    this.userRef.get().then(p => {
      p.forEach(element => {
       const user : User = element.data() as User;
       this.userRef.doc(user.userId).collection('conversations').get().then(a => {
         a.forEach(item => {
           this.userRef.doc(user.userId).collection('conversations').doc(item.data().conversationId).collection('participants').get().then(b => {
            b.forEach(it => {
              this.userRef.doc(user.userId).collection('conversations').doc(item.data().conversationId).collection('participants').doc(it.data().participantId).delete();
            });
           });
           this.userRef.doc(user.userId).collection('conversations').doc(item.data().conversationId).collection('messages').get().then(b => {
            b.forEach(it => {
              this.userRef.doc(user.userId).collection('conversations').doc(item.data().conversationId).collection('messages').doc(it.data().messageId).delete();
            });
           });
           this.userRef.doc(user.userId).collection('conversations').doc(item.data().conversationId).delete();
         });
       }) 
      });
    })
  }

  // REGISTER
  async addUser(credential : firebase.auth.UserCredential,displayName ?: string){
    const user : User = this._create.createUserData(credential,displayName);
    console.log(user);
    await this.afs.collection('users').doc(user.userId).set({
      userId : user.userId,
      displayName : user.displayName,
      email : user.email,
      creationTime : user.creationTime,
      avatar : user.avatar === null ? null : {
        avatarName : user.avatar.avatarName,
        contentType : user.avatar.contentType,
        deletedTime : user.avatar.deletedTime,
        isActive : user.avatar.isActive,
        isDeleted : user.avatar.isDeleted,
        size : user.avatar.size,
        downloadURL : user.avatar.downloadURL
      },
      bio : user.bio,
      deletedTime : user.deletedTime,
      isActive : user.isActive,
      isDeleted : user.isDeleted,
      settings : {
        darkTheme : user.settings.darkTheme,
        isPrivate : user.settings.isPrivate,
        notify : user.settings.notify
      }
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

  addAvatar(uid: string, file: File, fileName: string, contentType: string, downloadURL: string) {
    let data: Avatar = this._create.createAvatarData(fileName, contentType, file.size, downloadURL);
    return this.updateUserDataByUserId(uid, 'avatar', (Object.assign({}, data)));
  }

  getUser(userId: string) {
    return this.afs.collection('users').doc(userId);
  }

  getAllUsers(){
    return this.afs.collection('users');
  }

  getConversations(userId: string) {
    return this.afs.collection('users').doc(userId).collection('conversations',ref=> ref.where('isDeleted','==',false)).valueChanges();
  }

  getParticipants(userId: string, conversationId: string) {
    return this.afs.collection('users').doc(userId).collection('conversations').doc(conversationId).collection('participants').valueChanges();
  }

  getMessages(userId: string, conversationId: string) {
    return this.afs.collection('users').doc(userId).collection('conversations').doc(conversationId).collection('messages', ref => ref.orderBy('createdTime', 'asc')).valueChanges();
  }

  updateConversationDataByConversationId(uid: string, conversationId: string, key: string, value: any) {
    return this.userRef.doc(uid).collection('conversations').doc(conversationId).update(key, value);
  }

  // async hasConversation(currentUserId : string,guestId : string){
  //   const conversations = await this.userRef.doc(currentUserId).collection('conversations').get();
  //   conversations.forEach(async element => {
  //     const c = await this.userRef.doc(guestId).collection('conversations').doc(element.id).get();
  //   });
  // }

  //     this.userRef.doc(currentUserId).collection('conversations').get().then(p => {
  //       for (let i = 0; i < p.docs.length; i++) {
  //         this.userRef.doc(guestId).collection('conversations').doc('p.docs[i].id').get().then(r => {
  //           if (r.data()) {
  //             res(r.data().conversationId);
  //           }
  //         }).catch(e => {
  //           rej(e);
  //         });
  //       }
  //     })
  //     .catch(e => {
  //       rej(e);
  //     });
  //   })
  // }
}
