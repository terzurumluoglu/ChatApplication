import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import * as firebase from 'firebase/app';
import "firebase/auth";
import { firebaseConfig } from './helpers/firebase.config';
import { MODULES, COMPONENTS, PROVIDERS } from './app.imports';
import { HttpClientModule } from '@angular/common/http';
import { ConversationModule } from './components/conversation/conversation.module';
// import { ConversationModule } from './components/conversation/conversation.module';
// import { ConversationModule } from './components/lounge/conversation/conversation.module';
firebase.initializeApp(firebaseConfig);
// ng generate module articles/articles --module app --flat --routing

@NgModule({
  declarations: [
    AppComponent,
    // COMPONENTS,
  ],
  imports: [
    MODULES,
    HttpClientModule,
    ConversationModule
  ],
  providers: [
    PROVIDERS,
    {
      provide: 'apiUrl',
      useValue: 'https://us-central1-chatapp-e09a8.cloudfunctions.net/'
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
