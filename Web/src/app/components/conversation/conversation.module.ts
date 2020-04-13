import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConversationRoutingModule } from './conversation-routing.module';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ConversationComponent } from './conversation.component';
import { LastDataPipe } from 'src/app/pipes/lastData/last-data.pipe';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ParticipantPipe } from 'src/app/pipes/participant/participant.pipe';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ConversationIsActivePipe } from 'src/app/pipes/conversation-is-active/conversation-is-active.pipe';

@NgModule({
  declarations: [
    ConversationComponent,
    SidebarComponent,
    LastDataPipe,
    ParticipantPipe,
    EditProfileComponent,
    ConversationIsActivePipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConversationRoutingModule
  ],
  exports : [
    SidebarComponent,
    EditProfileComponent
  ]
})
export class ConversationModule { }
