import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/firebase/auth/auth.service';
import { Conversation, Participant, Message, User } from 'src/app/models/model';
import { Subscription, Observable } from 'rxjs';
import { DatabaseService } from 'src/app/services/firebase/database/database.service';
import { emptyAvatar } from "src/app/datas/paths";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Output() selectConversationEmitter = new EventEmitter();
  @Output() selectUserEmitter = new EventEmitter();
  @Output() sendParticipantsEmitter = new EventEmitter();
  currentUserId: string;
  users: Observable<User[]>;
  conversations: Conversation[];
  participants: Participant[] = [];
  messages: Message[] = [];
  subs: Subscription[] = [];
  emptyAvatar: string = emptyAvatar;
  constructor(
    private router: Router,
    private _auth: AuthService,
    private _db: DatabaseService
  ) {
    this.currentUserId = _auth.getCurrentUserId();
    this.main();
  }

  ngOnInit(): void {
  }

  main() {
    this.getConversations();
    this.getAllUsers();
  }

  getAllUsers(){
    this.users = this._db.getAllUsers().valueChanges() as Observable<User[]>;
  }

  getConversations() {
    const c: Observable<Conversation[]> = this._db.getConversations(this.currentUserId) as Observable<Conversation[]>;
    this.subs.push(
      c.subscribe((cSnapShot: Conversation[]) => {
        this.conversations = cSnapShot;
        this.getParticipants(cSnapShot);
        this.getMessages(cSnapShot);
      }));
  }

  getParticipants(ccc: Conversation[]) {
    ccc.forEach(element => {
      const p: Observable<Participant[]> = this._db.getParticipants(this.currentUserId, element.conversationId) as Observable<Participant[]>;
      this.subs.push(p.subscribe((pSnapShot: Participant[]) => {
        pSnapShot.forEach(el => {
          this.participants.push(el);
        });
      }));
    });
  }

  getGuestParticipantByConversationId(conversationId: string) {
    if (this.participants) {
      return this.participants.filter(p => p.conversationId == conversationId).find(p => p.user.userId != this.currentUserId);
    }
  }

  getMessages(ccc: Conversation[]) {
    ccc.forEach(element => {
      const m: Observable<Message[]> = this._db.getMessages(this.currentUserId, element.conversationId) as Observable<Message[]>;
      this.subs.push(
        m.subscribe((mSnapShot: Message[]) => {
          mSnapShot.forEach(el => {
            this.messages.push(el);
          });
        }))
    });
  }

  getMessagesByConversationId(conversationId: string) {
    if (this.messages) {
      return this.messages.filter(p => p.conversationId == conversationId);
    }
  }

  getUnReadMessage(messages : Message[]) : Message[]{
    if (messages) {
      return messages.filter(f => f.isRead == false && f.owner.userId != this.currentUserId);
    }
  }

  calculateUnReadMessage(messages : Message[]) : number{
    const m : Message[] = this.getUnReadMessage(messages);
    if (m) {
      return m.length;
    }
  }

  
  selectUser(userId: string) {
    this.selectUserEmitter.emit(userId);
    this.sendParticipantsEmitter.emit(this.participants);
    // this.isProfileShow = true;
  }

  
  selectConversation(conversationId: string) {
    this.selectConversationEmitter.emit(conversationId);
  }
}