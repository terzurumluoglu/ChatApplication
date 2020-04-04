import { Injectable } from '@angular/core';
import { AngularFireAuth } from "angularfire2/auth";
import * as firebase from "firebase/app";
import 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser: firebase.User;
  
  constructor(
    private angularFireAuth : AngularFireAuth
  ) {
    angularFireAuth.authState.subscribe(user => {
      if (user) {
        localStorage.setItem('userId',user.uid);
      } else {
        localStorage.setItem('userId',null);
      }
    })
  }

  getCurrentUserId(){
    return localStorage.getItem('userId') ?? null;
  }

  get isLoggedIn() : boolean{
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

  signOut() {
    return this.angularFireAuth.auth.signOut();
  }
}
