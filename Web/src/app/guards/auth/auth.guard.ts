import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';

import { AuthService } from 'src/app/services/firebase/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private _auth: AuthService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUserId = this._auth.getCurrentUserId();
    if (currentUserId && currentUserId !== 'null') {
      return true;
    }
    this.router.navigate(['home/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
