import { Injectable } from '@angular/core';
import * as firebase from "firebase";
import { ErrorInterceptor } from 'src/app/helpers/error.interceptor';
import { DatabaseService } from '../database/database.service';
import { User } from 'src/app/models/model';
import { FunctionsService } from '../functions/functions.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  fireAuth = firebase.auth();

  constructor(
    private _db : DatabaseService,
    private _functions : FunctionsService
    ) { }


  getCurrentUser(): Promise<any> {
    return new Promise((res, rej) => {
      firebase.auth().onAuthStateChanged(user => {
        res(user);
      });
    })
  }

  forgotPassword(email: string) {
    return this.fireAuth.sendPasswordResetEmail(email);
  }

  createUserWithEmailAndPassword(email: string, password: string) {
    return this.fireAuth.createUserWithEmailAndPassword(email,password);
  }

  signInWithEmailAndPassword(email: string, password: string) : Promise<firebase.auth.UserCredential>{
    return this.fireAuth.signInWithEmailAndPassword(email,password);
  }

  signOut() {
    return this.fireAuth.signOut();
  }
}
