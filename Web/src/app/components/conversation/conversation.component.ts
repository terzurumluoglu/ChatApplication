import { Component, OnInit, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { UserModel, User, ConversationModel, Conversation, Participant, Message } from 'src/app/models/model';
import { DatabaseService } from 'src/app/services/firebase/database/database.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/firebase/auth/auth.service';
import { Subscription,Observable,fromEvent,timer } from 'rxjs';
import { FcmService } from 'src/app/services/firebase/fcm/fcm.service';
import { emptyAvatar } from "src/app/datas/paths";

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css']
})
export class ConversationComponent implements OnInit {

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  pageHeight: number;
  user : User;
  users: Observable<User[]>;
  conversations : ConversationModel[] = [];
  hasConversation: boolean = true;
  selectedConversation: ConversationModel;
  selectedUser: User;
  messageForm: FormGroup;
  currentUserId: string;
  isProfileShow: boolean = false;
  theme: boolean = false
  notify: boolean = false;
  emptyAvatar: string = emptyAvatar;

  userSubs: Subscription;
  conversationSubs: Subscription;
  participantSubs: Subscription;
  messagesSubs: Subscription;
  keyListenerSubscription : Subscription;
  message : any;

  constructor(
    private formBuilder: FormBuilder,
    private _auth: AuthService,
    private _db: DatabaseService,
    private _fcm : FcmService
  ) {
    this.currentUserId = _auth.getCurrentUserId();
    this.main();
    this.fcm(this.currentUserId);
    document.onvisibilitychange = () => {
      if (_auth.getCurrentUserId()) {
        if (document.visibilityState === 'hidden') {
          this._db.updateUserDataByUserId(this.currentUserId,'status','offline');
        } else {
          this._db.updateUserDataByUserId(this.currentUserId,'status','online');
        } 
      }
    }
  }

  changeTheme(selectedTheme: boolean) {
    this.theme = selectedTheme;
    this._db.updateUserDataByUserId(this.currentUserId, 'settings.darkTheme', selectedTheme).then(() => {
      // Success
    }).catch(e => {
      // Fail      
      this.theme = !selectedTheme;
    });
  }

  changeNotify(selectedNotify: boolean) {
    this.notify = selectedNotify;
    this._db.updateUserDataByUserId(this.currentUserId, 'settings.notify', selectedNotify).then(() => {
      // Success
    }).catch(e => {
      // Fail
      this.notify = !selectedNotify;
    });
  }

  getUnReadMessage(messages : Message[]) : Message[]{
    if (messages && messages.length != 0) {
      return messages.filter(f => f.isRead == false && f.sender.userId != this.currentUserId);
    }
  }

  
  calculateUnReadMessage(messages : Message[]) : number{
    const m : Message[] = this.getUnReadMessage(messages);
    if (m) {
      return m.length;
    }
  }

  readMessage(conversation : ConversationModel){
    const m : Message[] = this.getUnReadMessage(conversation.messages);
    this._db.readMessage(conversation.conversation.conversationId,m,conversation.participants);
  }

  ngOnInit(): void {
    console.log('onInit!');
    // User is Online
    this._db.updateUserDataByUserId(this.currentUserId,'status','online');
  }
  
  resetTimer() {
    const time = timer(500);
    time.subscribe(p => {
      this.changeParticipantStatus(this.selectedConversation,this.currentUserId,'online');
    });
  }

  keyListener(){
    this.keyListenerSubscription = fromEvent(document, 'keypress').subscribe(e => {
      this.resetTimer();
      this.changeParticipantStatus(this.selectedConversation,this.currentUserId,'typing...');
    })
  }

  unsubscription(event: any) {
    if (this.userSubs) { this.userSubs.unsubscribe(); }
    if (this.conversationSubs) { this.conversationSubs.unsubscribe(); }
    if (this.participantSubs) { this.participantSubs.unsubscribe(); }
    if (this.messagesSubs) { this.messagesSubs.unsubscribe(); }
    if (this.keyListenerSubscription) { this.keyListenerSubscription.unsubscribe(); }
  }

  main() {
    this.getUser();
    this.createForm();
    this.getAllUsers();
    this.getConversation();
  }

  getUser(){
    this.theme = (JSON.parse(localStorage.getItem('user')) as UserModel).user.settings.darkTheme;
    this.userSubs = this._db.getUser(this.currentUserId).valueChanges().subscribe((user : User) => {
      this.user = user;
      this.theme = user.settings.darkTheme;
      this.notify = user.settings.notify;
      localStorage.setItem('user', JSON.stringify(new UserModel(user, [])));
    });
  }

  getAllUsers(){
    this.users = this._db.getAllUsers().valueChanges() as Observable<User[]>;
  }

  getConversation(){
    this.conversationSubs = this._db.getConversations(this.currentUserId).valueChanges().subscribe((cSnapShot : Conversation[]) => {
      let conversation : ConversationModel = new ConversationModel(null,null,null);
      cSnapShot.forEach(element => {
        conversation.conversation = element;
        this.participantSubs = null;
        this.participantSubs = this._db.getParticipants(this.currentUserId,element.conversationId).valueChanges().subscribe((pSnapShot : Participant[]) => {
          conversation.participants = pSnapShot;
        })
        this.messagesSubs = null;
        this.messagesSubs = this._db.getMessages(this.currentUserId,element.conversationId).valueChanges().subscribe((mSnapShot : Message[]) => {
          if (this.selectedConversation && this.selectedConversation.conversation.conversationId === element.conversationId) {
            console.log('OKUNACAK MESSAGE');
            this.readMessage(this.selectedConversation);
          }
          conversation.messages = mSnapShot;
          this.scrollToBottom();
        });
        this.conversations.push(conversation);
      });
    })
  }


  // FORM
  createForm() {
    this.messageForm = this.formBuilder.group({
      message: ['', Validators.required]
    });
  }

  get f() { return this.messageForm.controls; }

  onSubmit() {
    console.log(this.f);
    if (this.messageForm.invalid) {
      console.log('invalid');
    } else {
      const m: string = this.f.message.value;
      this.messageForm.reset();
      const receiver: User = this.selectedConversation.participants.find(p => p.user.userId != this.currentUserId).user;
      this._db.sendMessage(m, this.selectedConversation, this.user, receiver).then(() => {
        console.log('Message was sent succesfully');
      }).catch(e => {
        this.messageForm.controls.name.setValue(m);
      });
    }
  }


  // NAVIGATION

  selectConversation(conversationId: string) {
    this.selectedConversation = this.conversations.find(c => c.conversation.conversationId == conversationId);
    console.log(this.selectedConversation);
    this.changeParticipantStatus(this.selectedConversation,this.currentUserId,'online');
    this.readMessage(this.selectedConversation);
    this.keyListener();
    this.scrollToBottom();
  }

  changeParticipantStatus(selectedConversation : ConversationModel,userId,status : string){
    this._db.changeParticipantStatus(selectedConversation,userId,status);
  }

  selectUser(user: User) {
    this.selectedUser = user;
    this.isProfileShow = true;
  }

  closeProfile() {
    this.selectedUser = null;
    this.isProfileShow = false;
  }

  //RIGHT
  startConversation(selectedUser: User) {
    const con: ConversationModel = this.conversations.find(c => c.participants.find(p => p.user.userId === selectedUser.userId));
    if (con) {
      this.selectedConversation = con;
    } else {
      this.selectedConversation = this._db.startConversation(this.user, selectedUser);
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.pageHeight != this.myScrollContainer.nativeElement.scrollHeight) {
          this.pageHeight = this.myScrollContainer.nativeElement.scrollHeight;
          this.myScrollContainer.nativeElement.scrollTop = this.pageHeight;
        }
      } catch (err) {
        // console.log('111111111111');
      }
    });
  }

  fcm(userId : string){
    this._fcm.requestPermission(userId);
    this._fcm.receiveMessage();
    this.message = this._fcm.currentMessage;
  }
}