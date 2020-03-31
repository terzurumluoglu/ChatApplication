import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  logout(){
    // this._authentication.logout().then(() => {
    //   this.router.navigate(['/home/login']);
    // }).catch(err => {
    //   console.log(err);
    // })
  }

}
