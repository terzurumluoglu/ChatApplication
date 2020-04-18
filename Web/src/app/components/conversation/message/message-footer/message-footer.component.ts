import { Component, OnInit, Input, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FunctionsService } from 'src/app/services/firebase/functions/functions.service';
import { AuthService } from 'src/app/services/firebase/auth/auth.service';

@Component({
  selector: 'app-message-footer',
  templateUrl: './message-footer.component.html',
  styleUrls: ['./message-footer.component.css']
})
export class MessageFooterComponent implements OnInit, DoCheck {
  selectedConversationId: string;
  // INPUT
  @Input() selectedConversationInputChild: any;
  // INPUT

  currentUserId: string;
  messageForm: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private _auth: AuthService,
    // private _db: DatabaseService,
    private _functions: FunctionsService
  ) {
    this.currentUserId = _auth.getCurrentUserId();
    this.createForm();
  }

  ngOnInit(): void {
  }

  ngDoCheck() {
    if (this.selectedConversationInputChild && this.selectedConversationId !== this.selectedConversationInputChild) {
      this.selectedConversationId = this.selectedConversationInputChild;
    }
  }

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
    }
    else {
      const m: string = this.f.message.value;
      this.messageForm.reset();
      this._functions.sendMessage(this.currentUserId, this.selectedConversationId, m).subscribe((p: boolean) => {
        console.log(p);
      },
        (error) => {
          console.log(error);
        },
        () => {
          console.log('OK');
        });
    }
  }
}
