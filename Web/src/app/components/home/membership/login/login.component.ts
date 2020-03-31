import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/firebase/auth/auth.service';
import { DatabaseService } from 'src/app/services/firebase/database/database.service';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { Router } from '@angular/router';
import { ErrorInterceptor } from 'src/app/helpers/error.interceptor';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  title : string = 'Sign In';
  loginForm: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private router : Router,
    private _auth : AuthService,
    private _authentication : AuthenticationService,
    private _db : DatabaseService,
    private _error : ErrorInterceptor
    ) {
    this.createForm();
    if (this._authentication.currentUserValue) {
      this.router.navigate(['/conversation']);
    }
  }

  ngOnInit(): void {
  }

  get f() { return this.loginForm.controls; }

  async onSubmit() {
    try {
      const credential : firebase.auth.UserCredential = await this._auth.signInWithEmailAndPassword(this.f.email.value,this.f.password.value);
      try {
        const user = await this._db.logIn(credential.user.uid);
        this._authentication.saveUser(user);
        this.router.navigate(['/conversation']);
      } catch (er) {
        this._error.handleError(er);
      }
    } catch (error) {
      this._error.handleError(error);
    }
  }

  createForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

}
