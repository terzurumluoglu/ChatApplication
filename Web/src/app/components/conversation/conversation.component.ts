import { Component, OnInit, HostBinding, ViewChild, ElementRef } from '@angular/core';
import { UserModel, User, ConversationModel, Conversation, Participant, Message } from 'src/app/models/model';
import { DatabaseService } from 'src/app/services/firebase/database/database.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LocalService } from 'src/app/services/local/local.service';
import { AuthService } from 'src/app/services/firebase/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css'],
})
export class ConversationComponent implements OnInit {

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  pageHeight: number;
  userModel: UserModel;
  users: User[];
  conversations: ConversationModel[] = [];
  hasConversation: boolean = true;
  participant: User;
  selectedConversation: ConversationModel;
  selectedUser: User;
  messageForm: FormGroup;
  cons: Conversation[];
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
    private _db: DatabaseService,
    private _local: LocalService
  ) {
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
    console.log(this.userModel);
    
  }

  unsubscription(event: any) {
    if (this.userSubs) { this.userSubs.unsubscribe(); }
    if (this.conversationSubs) { this.conversationSubs.unsubscribe(); }
    if (this.participantSubs) { this.participantSubs.unsubscribe(); }
    if (this.messagesSubs) { this.messagesSubs.unsubscribe(); }
  }

  getLocalStorageUserModel(){
    if (localStorage.getItem('userModel') === undefined) {
      this._auth.signOut();
    }else{
      this.userModel = JSON.parse(localStorage.getItem('userModel'));
    }
  }

  main() {
    this.getLocalStorageUserModel();
    this.currentUserId = this.userModel.user.userId;
    this.theme = this.userModel.user.settings.darkTheme;
    this.notify = this.userModel.user.settings.notify;
    this.getUser();
    this.getConversations().then(() => {
      for (let i = 0; i < this.conversations.length; i++) {
        this.userModel.conversations[i] = this.conversations[i];
      }
    });
    this.createForm();
    this.getAllUsers();
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
      this._db.sendMessage(m, this.selectedConversation, this.userModel.user, receiver).then(() => {
        console.log('Message was sent succesfully');
      }).catch(e => {
        this.messageForm.controls.name.setValue(m);
        console.log(e);
      });
    }
  }

  async getConversations() {
    this.conversationSubs = this._db.getConversations(this.currentUserId).valueChanges().subscribe((snap : firebase.firestore.DocumentData[]) => {
      console.log(snap);
      this.cons = snap as Conversation[];
      this.hasConversation = this.cons.length == 0 ? false : true;
      // if (this.cons.length == 0) { localStorage.setItem('userModel', JSON.stringify(this.userModel)); }
      for (let i = 0; i < this.cons.length; i++) {
        const conversation = new Conversation(this.cons[i].conversationId, this.cons[i].createdTime, this.cons[i].owner, this.cons[i].deletedTime, this.cons[i].isActive, this.cons[i].isDeleted, this.cons[i].title);
        const conversationModel = new ConversationModel(conversation, null, null);
        let cm: ConversationModel = this.conversations.find(p => p.conversation.conversationId == conversationModel.conversation.conversationId)
        if (cm === undefined) {
          this.conversations.push(conversationModel);
        }
        else {
          cm.conversation = conversationModel.conversation;
        }
        this.change(1, conversationModel.conversation, i);
      }
      this.getParticipants();
      this.getMessages();
    });
  }

  getParticipants() {
    for (let i = 0; i < this.cons.length; i++) {
      this.participantSubs = this._db.getParticipants(this.currentUserId, this.cons[i].conversationId).valueChanges().subscribe(snapshot => {
        const parts: Participant[] = snapshot as Participant[];
        this.conversations[i].participants = parts;
        this.change(2, parts, i);
      });
    }
  }

  getMessages() {
    for (let i = 0; i < this.cons.length; i++) {
      this.messagesSubs = this._db.getMessages(this.currentUserId, this.cons[i].conversationId).valueChanges().subscribe(snapshot => {
        const messages: Message[] = snapshot as Message[];
        this.conversations[i].messages = messages;
        this.scrollToBottom();
        this.change(3, messages, i);
      });
    }
  }

  getUser() {
    this.userSubs = this._db.getUser(this.userModel.user.userId).valueChanges().subscribe(snap => {
      // this.theme = this.userModel.user.settings.darkTheme;
      // this.notify = this.userModel.user.settings.notify;
      this.change(4, snap);
    })
  }

  change(type: number, data: any, index?: number) {
    console.log(typeof data);
    if (this.userModel.conversations.length === 0 && type === 1) {
      const cm : ConversationModel = new ConversationModel(data,[],[]);
      this.userModel.conversations.push(cm);
    } else {
      if (type === 1) {
        this.userModel.conversations[index].conversation = data;
      } else if (type === 2) {
        this.userModel.conversations[index].participants = data;
      } else if (type === 3) {
        this.userModel.conversations[index].messages = data;
      } else {
        this.userModel.user = data;
      }
    }
    localStorage.setItem('userModel', JSON.stringify(this.userModel));
  }

  // NAVIGATION

  selectConversation(conversationId: string) {
    this.selectedConversation = this.userModel.conversations.find(c => c.conversation.conversationId == conversationId);
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

  async getAllUsers() {
    this.users = await this._db.getAllUsers(this.currentUserId);
  }

  //RIGHT
  startConversation(selectedUser: User) {
    const con: ConversationModel = this._local.getConversation(selectedUser);
    console.log(con);
    if (con) {
      this.selectedConversation = con;
    } else {
      this.selectedConversation = this._db.startConversation(this.userModel.user, selectedUser);
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