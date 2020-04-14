import { Injectable } from '@angular/core';
import { AngularFireAuth } from "angularfire2/auth";
import * as firebase from "firebase/app";
import 'firebase/auth';
import { DatabaseService } from '../database/database.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser: firebase.User;
  constructor(
    private angularFireAuth: AngularFireAuth,
    private _db: DatabaseService
  ) {
    angularFireAuth.authState.subscribe(user => {
      if (user) {
        localStorage.setItem('userId',user.uid);
      } else {
        localStorage.removeItem('userId');
      }
    })
  }

  getCurrentUserId() {
    return localStorage.getItem('userId') ?? null;
  }

  get isLoggedIn(): boolean {
    return this.getCurrentUserId() !== null;
  }

  forgotPassword(email: string) {
    return this.angularFireAuth.auth.sendPasswordResetEmail(email);
  }

  createUserWithEmailAndPassword(email: string, password: string) {
    return this.angularFireAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  signInWithEmailAndPassword(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return this.angularFireAuth.auth.signInWithEmailAndPassword(email, password);
  }

  signInWithGoogle(){
    var provider = new firebase.auth.GoogleAuthProvider();
    // const googleProvider = this.angularFireAuth.auth.pro
    return this.angularFireAuth.auth.signInWithPopup(provider);
  }

  signOut() {
    return new Promise((res,rej) => {
      this._db.updateUserDataByUserId(this.getCurrentUserId(),'status','offline').then(() => {
        this.angularFireAuth.auth.signOut().then(() => {
          localStorage.removeItem('userId');
          res(true);
        }).catch(() => {
          rej('0002'); // Sign out Fail
        })
      }).catch(() => {
        rej('0001'); // DB Update Fail
      });
    });
  }
}
