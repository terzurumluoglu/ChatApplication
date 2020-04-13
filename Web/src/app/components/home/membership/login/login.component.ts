import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/firebase/auth/auth.service';
import { DatabaseService } from 'src/app/services/firebase/database/database.service';
import { Router } from '@angular/router';
import { ErrorInterceptor } from 'src/app/helpers/error.interceptor';
import { User, UserModel } from 'src/app/models/model';
import { loaderImage } from "src/app/datas/paths";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  title: string = 'Sign In';
  loginForm: FormGroup;
  loader : boolean = false;
  image : string = loaderImage;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private _auth: AuthService,
    private _db: DatabaseService,
    private _error: ErrorInterceptor
  ) {
    this.createForm();
  }

  ngOnInit(): void {
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.loader = true;
    this._auth.signInWithEmailAndPassword(this.f.email.value, this.f.password.value).then(credential => {
      this._db.getUser(credential.user.uid).get().subscribe((user) => {
        localStorage.setItem('user', JSON.stringify(new UserModel(user.data() as User, [])));
        this.loader = false;
        this.router.navigate(['/conversation']);
      })
    }).catch(e => {
      this.loader = false;
      this._error.handleError(e);
    });
  }

  createForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required,Validators.email]],
      password: ['', [Validators.required]]
    });
  }
}
