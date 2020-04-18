import { Component, OnInit, Input, DoCheck, Output, EventEmitter } from '@angular/core';
import { emptyAvatar } from "src/app/datas/paths";
import { DatabaseService } from 'src/app/services/firebase/database/database.service';
import { User, Conversation, Participant } from 'src/app/models/model';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/firebase/auth/auth.service';
import { FunctionsService } from 'src/app/services/firebase/functions/functions.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit,DoCheck {
  selectedUserId: string;
  // INPUT
  @Input() selectedUserInputChild: any;
  @Input() participantsInputChild: any;
  @Output() selectConversationProfileEmitter = new EventEmitter();
  emptyAvatar : string = emptyAvatar;
  user : User;
  userSubscription : Subscription;
  currentUserId : string;
  conversationSubscription : Subscription;
  conversationId : string;
  participants : Participant[];
  constructor(
    private _auth : AuthService,
    private _db : DatabaseService,
    private _functions : FunctionsService
  ) {
    this.currentUserId = _auth.getCurrentUserId();
  }

  ngOnInit(): void {
  }

  ngDoCheck() {
    if (this.selectedUserInputChild && this.selectedUserId !== this.selectedUserInputChild) {
      this.selectedUserId = this.selectedUserInputChild;
      this.participants = this.participantsInputChild;
      this.getUser();
      this.hasConversation();
    }
  }

  getUser(){
    this.userSubscription = this._db.getUser(this.selectedUserId).valueChanges().subscribe((u : User) => {
      this.user = u;
    });
  }

  startConversation(){
    const conversationId : string = this.hasConversation();
    if (conversationId) {
      this.selectConversationProfileEmitter.emit(conversationId);
    } else {
      this._functions.createConversation(this.currentUserId,this.selectedUserId).subscribe((p : string) => {
        this.selectConversationProfileEmitter.emit(p);
      },
        (error) => {
          console.log(error);
        },
        () => {
          console.error('Request completed'); 
        }
      )
    }
  }

  hasConversation() : string{
    const part : Participant = this.participants.find(p => p.user.userId === this.selectedUserId);
    return part ? part.conversationId : null;
  }

  closeProfile() {
    this.userSubscription.unsubscribe();
    this.selectedUserId = null;
  }

}
