import { Injectable } from '@angular/core';
import { AngularFirestore } from "angularfire2/firestore";
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireMessaging } from "angularfire2/messaging";
import { mergeMapTo } from 'rxjs/operators';
import { take } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs'
import { DatabaseService } from '../database/database.service';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  currentMessage = new BehaviorSubject(null);
  constructor(
    private angularFirestore: AngularFirestore,
    private angularFireAuth: AngularFireAuth,
    private angularFireMessaging: AngularFireMessaging,
    private _db : DatabaseService) {
    this.angularFireMessaging.messaging.subscribe(
      (_messaging) => {
        _messaging.onMessage = _messaging.onMessage.bind(_messaging);
        _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
      }
    )
  }

  userRef(userId : string){
    return this.angularFirestore.collection('users').doc(userId);
  }

  /**
   * update token in firebase database
   * 
   * @param userId userId as a key 
   * @param token token as a value
   */
  addToken(userId : string, token : string) {
    // we can change this function to request our backend service
    this.angularFireAuth.authState.pipe(take(1)).subscribe(
      () => {
        this._db.addDevice(userId,token);
      })
  }

  /**
   * request permission for notification from firebase cloud messaging
   * 
   * @param userId userId
   */
  requestPermission(userId : string) {
    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        this.addToken(userId, token);
      },
      (err) => {
        console.error('Unable to get permission to notify.', err);
      }
    );
  }

  /**
   * hook method when new notification received in foreground
   */
  receiveMessage() {
    console.log('HOP');
    this.angularFireMessaging.messages.subscribe(
      (payload) => {
        console.log("new message received. ", payload);
        this.currentMessage.next(payload);
      },e => {console.log(e)})
  }
}