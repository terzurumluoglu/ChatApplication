import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AngularFireModule } from "angularfire2";
import { firebaseConfig } from './helpers/firebase.config';
import { MODULES, COMPONENTS, PROVIDERS } from './app.imports';
import { HttpClientModule } from '@angular/common/http';
import { ConversationModule } from './components/conversation/conversation.module';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import * as firebase from 'firebase/app';
import { AngularFireMessagingModule } from 'angularfire2/messaging';
// ng generate module articles/articles --module app --flat --routing

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    MODULES,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule.enablePersistence(),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireMessagingModule,
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
