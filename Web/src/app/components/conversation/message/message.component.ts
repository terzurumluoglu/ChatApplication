import { Component, OnInit, Input, DoCheck } from '@angular/core';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit,DoCheck {
  a : string = '';
  @Input() selectedConversationInputChild: any;
  selectedConversationInputParent : string;
  // @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  // pageHeight: number;
  constructor() { }

  ngOnInit(): void {
  }

  ngDoCheck(){
    if (this.selectedConversationInputChild && this.selectedConversationInputParent !== this.selectedConversationInputChild) {
      this.selectedConversationInputParent = this.selectedConversationInputChild;
    }
  }

  // scrollToBottom(): void {
  //   setTimeout(() => {
  //     try {
  //       if (this.pageHeight != this.myScrollContainer.nativeElement.scrollHeight) {
  //         this.pageHeight = this.myScrollContainer.nativeElement.scrollHeight;
  //         this.myScrollContainer.nativeElement.scrollTop = this.pageHeight;
  //       }
  //     } catch (err) {
  //       // console.log('111111111111');
  //     }
  //   });
  // }

  
  // getUnReadMessage(messages : Message[]) : Message[]{
  //   if (messages) {
  //     return messages.filter(f => f.isRead == false && f.owner.userId != this.currentUserId);
  //   }
  // }


  // readMessage(conversation : ConversationModel){
  //   const m : Message[] = this.getUnReadMessage(conversation.messages);
  //   this._functions.readMessage(this.currentUserId,conversation.conversation.conversationId);
  // }


  
  // resetTimer() {
  //   const time = timer(500);
  //   time.subscribe(p => {
  //     this.changeParticipantStatus(this.selectedConversation,this.currentUserId,'online');
  //   });
  // }

  // keyListener(){
  //   this.keyListenerSubscription = fromEvent(document, 'keypress').subscribe(e => {
  //     this.resetTimer();
  //     this.changeParticipantStatus(this.selectedConversation,this.currentUserId,'typing...');
  //   })
  // }
  


}
