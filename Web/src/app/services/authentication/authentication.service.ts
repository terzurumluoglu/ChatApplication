import { Injectable } from '@angular/core';
import { User } from 'src/app/models/model';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../firebase/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  constructor(private _auth : AuthService) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  saveUser(user: User) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout() {
    return new Promise((res, rej) => {
      this._auth.signOut().then(() => {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        res(true);
      }).catch(err => {
        rej(err);
      });
    });
  }
}
