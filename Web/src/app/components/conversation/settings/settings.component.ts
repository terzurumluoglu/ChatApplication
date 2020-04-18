import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

   
  // changeTheme(selectedTheme: boolean) {
  //   this.theme = selectedTheme;
  //   this._db.updateUserDataByUserId(this.currentUserId, 'settings.darkTheme', selectedTheme).then(() => {
  //     // Success
  //   }).catch(e => {
  //     // Fail      
  //     this.theme = !selectedTheme;
  //   });
  // }

  // changeNotify(selectedNotify: boolean) {
  //   this.notify = selectedNotify;
  //   this._db.updateUserDataByUserId(this.currentUserId, 'settings.notify', selectedNotify).then(() => {
  //     // Success
  //   }).catch(e => {
  //     // Fail
  //     this.notify = !selectedNotify;
  //   });
  // }


}
