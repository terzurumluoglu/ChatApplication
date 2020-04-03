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
// ng generate module articles/articles --module app --flat --routing

@NgModule({
  declarations: [
    AppComponent,
    // COMPONENTS,
  ],
  imports: [
    AngularFireModule.initializeApp(firebaseConfig),
    MODULES,
    HttpClientModule,
    ConversationModule,
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule
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
