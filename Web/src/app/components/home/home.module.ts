import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home.component';
import { LoginComponent } from './membership/login/login.component';
import { RegisterComponent } from './membership/register/register.component';

@NgModule({
  declarations: [
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    // LoginComponent,
    // RegisterComponent,
    // PhoneComponent,
    // ResetPasswordComponent,
    // LockScreenComponent,
    // ConfirmEmailComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    ReactiveFormsModule
  ]
})

export class HomeModule { }
