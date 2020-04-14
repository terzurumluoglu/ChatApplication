import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ErrorInterceptor } from 'src/app/helpers/error.interceptor';
import { DatabaseService } from 'src/app/services/firebase/database/database.service';
import { AuthService } from 'src/app/services/firebase/auth/auth.service';
import { Router } from '@angular/router';
import { User, UserModel } from 'src/app/models/model';
import { loaderImage } from "src/app/datas/paths";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  title : string = 'Create Account';
  registerForm: FormGroup;
  loader : boolean = false;
  image : string = loaderImage;
  constructor(
    private formBuilder: FormBuilder,
    private router : Router,
    private _auth : AuthService,
    private _db : DatabaseService,
    private _error : ErrorInterceptor
  ) {
    this.createForm();
  }

  ngOnInit(): void {
  }

  get f() { return this.registerForm.controls; }

  onSubmit() {
    this.loader = true;
    this._auth.createUserWithEmailAndPassword(this.f.email.value,this.f.password.value).then(credential => {
      console.log(JSON.stringify(credential));
      // this._db.addUser(this.f.firstname.value, credential).then((user : User) => {
      //   localStorage.setItem('user', JSON.stringify(new UserModel(user, [])));
      //   this.loader = false;
      //   this.router.navigate(['/conversation']);
      // });
    }).catch(e => {
      this.loader = false;
      this._error.handleError(e);
    })
  }

  createForm() {
    this.registerForm = this.formBuilder.group({
      displayName: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      passwordVerify: ['', Validators.required]
    });
  }
}
