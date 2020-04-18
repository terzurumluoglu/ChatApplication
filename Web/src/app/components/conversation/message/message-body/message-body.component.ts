import { Component, OnInit, Input, DoCheck } from '@angular/core';
import { AuthService } from 'src/app/services/firebase/auth/auth.service';
import { DatabaseService } from 'src/app/services/firebase/database/database.service';
import { Message } from 'src/app/models/model';

@Component({
  selector: 'app-message-body',
  templateUrl: './message-body.component.html',
  styleUrls: ['./message-body.component.css']
})
export class MessageBodyComponent implements OnInit,DoCheck {
  selectedConversationId : string;
  // INPUT
  @Input() selectedConversationInputChild: any;
  // INPUT
  currentUserId : string;
  messages : Message[] = [];
  constructor(
    private _auth : AuthService,
    private _db : DatabaseService
  ) {
    this.currentUserId = _auth.getCurrentUserId();
  }

  ngOnInit(): void {
  }

  ngDoCheck(){
    if (this.selectedConversationInputChild && this.selectedConversationId !== this.selectedConversationInputChild) {
      this.selectedConversationId = this.selectedConversationInputChild;
      this.getMessages();
    }
  }

  getMessages(){
    this._db.getMessages(this.currentUserId,this.selectedConversationId).subscribe((snap : Message[]) => {
      console.log(snap);
      for (let i = 0; i < snap.length; i++) {
        this.messages[i] = snap[i];
      }
    });
  }
}
