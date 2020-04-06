import { Component, OnInit, HostBinding, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { UserModel, User, ConversationModel, Conversation, Participant, Message } from 'src/app/models/model';
import { DatabaseService } from 'src/app/services/firebase/database/database.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/firebase/auth/auth.service';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css'],
})
export class ConversationComponent implements OnInit,OnDestroy {

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
  emptyAvatar: string = './assets/dist/media/img/empty-avatar.png';

  public userSubs: Subscription;
  public conversationSubs: Subscription;
  public participantSubs: Subscription;
  public messagesSubs: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private _auth: AuthService,
    private _db: DatabaseService
  ) {
    this.currentUserId = _auth.getCurrentUserId();
    this.main();
  }

  changeTheme(selectedTheme: boolean) {
    console.log(selectedTheme);

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

  ngOnInit(): void {
    console.log('onInit!');
  }
  ngOnDestroy(){
    console.log('destroyed!');
  }

  unsubscription(event: any) {
    console.log(event);
    if (this.userSubs) { this.userSubs.unsubscribe(); }
    if (this.conversationSubs) { this.conversationSubs.unsubscribe(); }
    if (this.participantSubs) { this.participantSubs.unsubscribe(); }
    if (this.messagesSubs) { this.messagesSubs.unsubscribe(); }
  }

  main() {
    this.getUser();
    this.createForm();
    this.getAllUsers();
    this.getConversation();
    console.log(this.conversations);
  }

  getUser(){
    this.userSubs = this._db.getUser(this.currentUserId).valueChanges().subscribe((user : User) => {
      this.user = user;
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
        this.participantSubs = this._db.getParticipants(this.currentUserId,element.conversationId).valueChanges().subscribe((pSnapShot : Participant[]) => {
          conversation.participants = pSnapShot;
        })
        this.messagesSubs = this._db.getMessages(this.currentUserId,element.conversationId).valueChanges().subscribe((mSnapShot : Message[]) => {
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
        console.log(e);
      });
    }
  }


  // NAVIGATION

  selectConversation(conversationId: string) {
    this.selectedConversation = this.conversations.find(c => c.conversation.conversationId == conversationId);
    console.log(this.selectedConversation);
    this.scrollToBottom();
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
    console.log(con);
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
    }, 250);
  }
  
  
}