import { Injectable } from '@angular/core';
import { UserModel, User, ConversationModel, Conversation, Participant, Message } from 'src/app/models/model';
import { DatabaseService } from '../firebase/database/database.service';

@Injectable({
  providedIn: 'root'
})
export class LocalService {

  userModel: UserModel;
  constructor(
    private _db: DatabaseService
  ) { }

  getLocalStorageData(key: string) {
    return localStorage.getItem(key) == undefined ? null : localStorage.getItem(key);
  }

  setLocalStorage(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  // ForEach
  getConversation(receiver: User) : ConversationModel {
    this.userModel = JSON.parse(this.getLocalStorageData('userModel'));
    let con: ConversationModel;
    this.userModel.conversations.forEach(conversation => {
      conversation.participants.forEach(participant => {
        if (participant.user.userId === receiver.userId) {
          con = conversation;
        }
      });
    });
    return con;
  }

  // For
  // getConversationId(sender: User, receiver: User) {
  //   console.log(receiver.userId);
  //   this.userModel = JSON.parse(this.getLocalStorageData('userModel'));
  //   console.log(this.userModel);
  //   let conversationId: string;
  //   for (let i = 0; i < this.userModel.conversations.length; i++) {
  //     for (let j = 0; j < this.userModel.conversations[i].participants.length; j++) {
  //       console.log(this.userModel.conversations[i].participants[j].user.userId);
  //       if (this.userModel.conversations[i].participants[j].user.userId === receiver.userId) {
  //         conversationId = this.userModel.conversations[i].conversation.conversationId;
  //         console.log(conversationId);
  //       }
  //     } 
  //   }
  //   return conversationId;
  // }
}
