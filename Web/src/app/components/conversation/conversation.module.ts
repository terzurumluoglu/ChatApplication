import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConversationRoutingModule } from './conversation-routing.module';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ConversationComponent } from './conversation.component';
import { LastDataPipe } from 'src/app/pipes/lastData/last-data.pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { ParticipantPipe } from 'src/app/pipes/participant/participant.pipe';

@NgModule({
  declarations: [
    ConversationComponent,
    SidebarComponent,
    LastDataPipe,
    ParticipantPipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConversationRoutingModule
  ],
  exports : [
    SidebarComponent
  ]
})
export class ConversationModule { }
