import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { LoginComponent } from './membership/login/login.component';
import { RegisterComponent } from './membership/register/register.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'register',
        component: RegisterComponent
      },
      // {
      //   path: 'phone',
      //   component: PhoneComponent
      // },
      // {
      //   path: 'confirmemail',
      //   component: ConfirmEmailComponent
      // },
      // {
      //   path: 'lockscreen',
      //   component: LockScreenComponent
      // },
      // {
      //   path: 'resetpassword',
      //   component: ResetPasswordComponent
      // }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
