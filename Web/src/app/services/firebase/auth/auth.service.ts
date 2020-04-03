import { Injectable } from '@angular/core';
import { DatabaseService } from '../database/database.service';
import { FunctionsService } from '../functions/functions.service';
import { AngularFireAuth } from "angularfire2/auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  currentUser: firebase.User;
  
  constructor(
    private angularFireAuth : AngularFireAuth,
    private _db: DatabaseService,
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
