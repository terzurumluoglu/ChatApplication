import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/firebase/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RouteGuard implements CanActivate {
  constructor(
    private router: Router,
    private _auth: AuthService
  ) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const currentUserId = this._auth.getCurrentUserId();
      if (currentUserId && currentUserId !== 'null') {
        this.router.navigate(['conversation']); 
        return false;
      }else{
        return true;
      }
  }
  
}
