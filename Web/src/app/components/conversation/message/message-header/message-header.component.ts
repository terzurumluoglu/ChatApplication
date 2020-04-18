import { Component, OnInit, Input, DoCheck } from '@angular/core';
import { emptyAvatar } from "src/app/datas/paths";
import { DatabaseService } from 'src/app/services/firebase/database/database.service';
import { AuthService } from 'src/app/services/firebase/auth/auth.service';
import { Participant } from 'src/app/models/model';

@Component({
  selector: 'app-message-header',
  templateUrl: './message-header.component.html',
  styleUrls: ['./message-header.component.css']
})
export class MessageHeaderComponent implements OnInit, DoCheck {
  selectedConversationId: string;
  // INPUT
  @Input() selectedConversationInputChild: any;
  // INPUT

  currentUserId: string;
  emptyAvatar: string = emptyAvatar;
  participant: Participant;
  constructor(
    private _auth: AuthService,
    private _db: DatabaseService
  ) {
    this.currentUserId = _auth.getCurrentUserId();
  }

  ngOnInit(): void {
  }

  ngDoCheck() {
    if (this.selectedConversationInputChild && this.selectedConversationId !== this.selectedConversationInputChild) {
      this.selectedConversationId = this.selectedConversationInputChild;
      this.getParticipants();
    }
  }

  getParticipants() {
    this._db.getParticipants(this.currentUserId, this.selectedConversationId).subscribe((snap: Participant[]) => {
      this.participant = snap.find(f => f.user.userId !== this.currentUserId);
    });
  }
}
