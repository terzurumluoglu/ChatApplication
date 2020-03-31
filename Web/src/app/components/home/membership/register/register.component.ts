import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ErrorInterceptor } from 'src/app/helpers/error.interceptor';
import { DatabaseService } from 'src/app/services/firebase/database/database.service';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { AuthService } from 'src/app/services/firebase/auth/auth.service';
import { Router } from '@angular/router';
import { User } from 'src/app/models/model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  title : string = 'Create Account';
  registerForm: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private router : Router,
    private _auth : AuthService,
    private _authentication : AuthenticationService,
    private _db : DatabaseService,
    private _error : ErrorInterceptor
  ) {
    this.createForm();
  }

  ngOnInit(): void {
  }

  get f() { return this.registerForm.controls; }

  async onSubmit() {
    try {
      const credential : firebase.auth.UserCredential = await this._auth.createUserWithEmailAndPassword(this.f.email.value,this.f.password.value);
      try {
        const user: User = await this._db.addUser(this.f.firstname.value, this.f.lastname.value, credential);
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
    this.registerForm = this.formBuilder.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      passwordVerify: ['', Validators.required]
    });
  }
}
