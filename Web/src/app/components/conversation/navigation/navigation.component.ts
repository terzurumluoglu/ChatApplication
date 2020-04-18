import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/firebase/auth/auth.service';
import { ErrorInterceptor } from 'src/app/helpers/error.interceptor';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  @Output() unsubscribe = new EventEmitter();
  constructor(
    private router: Router,
    private _auth: AuthService,
    private _error: ErrorInterceptor
  ) { }

  ngOnInit(): void {
  }

  logout() {
    this.unsubscribe.emit(true);
    this._auth.signOut().then(() => {
      this.router.navigate(['/home/login']);
    }).catch(e => {
      this._error.handleError(e);
    });
  }

}
