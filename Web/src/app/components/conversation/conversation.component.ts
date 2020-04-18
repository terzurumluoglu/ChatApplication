import { Component, OnInit, Input } from '@angular/core';
import { User, ConversationModel, Participant } from 'src/app/models/model';
import { DatabaseService } from 'src/app/services/firebase/database/database.service';
import { AuthService } from 'src/app/services/firebase/auth/auth.service';
import { FcmService } from 'src/app/services/firebase/fcm/fcm.service';
import { FunctionsService } from 'src/app/services/firebase/functions/functions.service';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css']
})
export class ConversationComponent implements OnInit {
  
  user : User;

  theme : boolean = true;
  currentUserId: string;
  message : any;
  selectedConversationInputParent : string;
  selectedUserInputParent : string;
  participantsInputParent : Participant[];
  constructor(
    private _auth: AuthService,
    private _db: DatabaseService,
    private _fcm : FcmService,
    private _functions : FunctionsService
  ) {
    this.currentUserId = _auth.getCurrentUserId();
    this.main();
    this.fcm();
    this.updateStatus();
  }

  selectedConversation(selectedConversationId : string){
    this.selectedConversationInputParent = selectedConversationId;
  }

  selectedConversationProfile(selectedConversationId : string){
    this.selectedConversationInputParent = selectedConversationId;
  }

  selectedUser(selectedUserId : string){
    this.selectedUserInputParent = selectedUserId;
  }

  sendParticipants(participants : Participant[]){
    this.participantsInputParent = participants;
  }

  ngOnInit(): void {
    console.log('onInit!');
    // User is Online
    this._db.updateUserDataByUserId(this.currentUserId,'status','online');
  }
  
  unsubscription(event: any) {
  }

  main() {
  }

  updateStatus(){
    document.onvisibilitychange = () => {
      if (this._auth.getCurrentUserId()) {
        if (document.visibilityState === 'hidden') {
          this._db.updateUserDataByUserId(this.currentUserId,'status','offline');
        } else {
          this._db.updateUserDataByUserId(this.currentUserId,'status','online');
        } 
      }
    }
  }

  changeParticipantStatus(selectedConversation : ConversationModel,userId,status : string){
    this._db.changeParticipantStatus(selectedConversation,userId,status);
  }

  fcm(){
    this._fcm.requestPermission(this.currentUserId);
    this._fcm.receiveMessage();
    this.message = this._fcm.currentMessage;
  }
}