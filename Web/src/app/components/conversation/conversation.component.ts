import { Component, OnInit, HostBinding, ViewChild, ElementRef } from '@angular/core';
import { UserModel, User, ConversationModel, Conversation, Participant, Message } from 'src/app/models/model';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { DatabaseService } from 'src/app/services/firebase/database/database.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LocalService } from 'src/app/services/local/local.service';

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
  participant: User;
  selectedConversation: ConversationModel;
  selectedUser: User;
  messageForm: FormGroup;
  cons: Conversation[];
  currentUser: User;
  isProfileShow: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private _authentication: AuthenticationService,
    private _db: DatabaseService,
    private _local: LocalService
  ) {
    this.main();
  }

  ngOnInit(): void {
  }

  main() {
    this.currentUser = this._authentication.currentUserValue;
    if (localStorage.getItem('userModel')) {
      this.userModel = JSON.parse(localStorage.getItem('userModel'));
      this.getConversations().then(() => {
        this.userModel.user = this.currentUser;
        for (let i = 0; i < this.conversations.length; i++) {
          this.userModel.conversations[i] = this.conversations[i];
        }
      });
    }
    else {
      this.getConversations().then(() => {
        this.userModel = new UserModel(this.currentUser, this.conversations);
      });
    }
    this.createForm();
    // this.getConversations().then(() => {
    //   this.userModel = new UserModel(this.currentUser, this.conversations);
    // });
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
      const receiver: User = this.selectedConversation.participants.find(p => p.user.userId != this.currentUser.userId).user;
      this._db.sendMessage(m, this.selectedConversation, this.currentUser, receiver).then(() => {
        console.log('Message was sent succesfully');
      }).catch(e => {
        this.messageForm.controls.name.setValue(m);
        console.log(e);
      });
    }
  }

  async getConversations() {
    this._db.getConversations(this.currentUser).onSnapshot(snap => {
      this.cons = snap.docs.map((doc: any) => doc.data()) as Conversation[];
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
        this.change(1, i, conversationModel.conversation);
      }
      this.getParticipants();
      this.getMessages();
    });
  }

  getParticipants() {
    for (let i = 0; i < this.cons.length; i++) {
      this._db.getParticipants(this.currentUser, this.cons[i].conversationId).onSnapshot(snapshot => {
        const parts: Participant[] = snapshot.docs.map((doc: any) => doc.data());
        this.conversations[i].participants = parts;
        this.change(2, i, parts);
      });
    }
  }

  getMessages() {
    for (let i = 0; i < this.cons.length; i++) {
      this._db.getMessages(this.currentUser, this.cons[i].conversationId).onSnapshot(snapshot => {
        const messages: Message[] = snapshot.docs.map((doc: any) => doc.data());
        this.conversations[i].messages = messages;
        this.scrollToBottom();
        this.change(3, i, messages);
      });
    }
  }

  change(type: number, index: number, data: any) {
    if (type === 1) {
      this.userModel.conversations[index].conversation = data;
    } else if (type === 2) {
      this.userModel.conversations[index].participants = data;
    } else {
      this.userModel.conversations[index].messages = data;
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
    this.isProfileShow = false;
  }

  async getAllUsers() {
    this.users = await this._db.getAllUsers(this.currentUser.userId);
  }

  //RIGHT
  startConversation(selectedUser: User) {
    const con: ConversationModel = this._local.getConversation(selectedUser);
    if (con === null) {
      this.selectedConversation = this._db.startConversation(this.currentUser, selectedUser);
    } else {
      this.selectedConversation = con;
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
        console.log('111111111111');
      }
    }, 250);
  }
}