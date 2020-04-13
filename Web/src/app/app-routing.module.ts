import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth/auth.guard';
import { ConversationComponent } from './components/conversation/conversation.component';
import { RouteGuard } from './guards/route/route.guard';

const routes: Routes = [
  {
    path : '',
    redirectTo : 'home',
    pathMatch: 'full'
  },
  {
    path : 'home',
    loadChildren: () => import('./components/home/home.module')
    .then(m => m.HomeModule),
    canActivate : [RouteGuard]
  },
  {
    path : 'conversation',
    component : ConversationComponent,
    canActivate : [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
