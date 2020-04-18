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
import { NavigationComponent } from './navigation/navigation.component';
import { MessageComponent } from './message/message.component';
// import { ProfileComponent } from './profile/profile.component';
// import { SettingsComponent } from './settings/settings.component';
import { MessageHeaderComponent } from './message/message-header/message-header.component';
import { MessageBodyComponent } from './message/message-body/message-body.component';
import { MessageFooterComponent } from './message/message-footer/message-footer.component';
import { ProfileComponent } from './profile/profile.component';

@NgModule({
  declarations: [
    ConversationComponent,
    SidebarComponent,
    LastDataPipe,
    ParticipantPipe,
    EditProfileComponent,
    ConversationIsActivePipe,
    NavigationComponent,
    MessageComponent,
    // ProfileComponent,
    // SettingsComponent,
    MessageHeaderComponent,
    MessageBodyComponent,
    MessageFooterComponent,
    ProfileComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConversationRoutingModule
  ],
  exports : [
    EditProfileComponent,
    NavigationComponent,
    MessageComponent,
    // ProfileComponent,
    // SettingsComponent,
    MessageHeaderComponent,
    MessageBodyComponent,
    MessageFooterComponent,
    ProfileComponent
  ]
})
export class ConversationModule { }
