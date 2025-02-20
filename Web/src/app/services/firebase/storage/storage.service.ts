import { Injectable } from '@angular/core';
import { ToolService } from '../../tool/tool.service';
import { DatabaseService } from '../database/database.service';
import { AngularFireStorage, AngularFireStorageReference } from "angularfire2/storage";
import * as firebase from "firebase/app";
import 'firebase/storage';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  appName: string = 'ChatApplication';
  ref : AngularFireStorageReference = this.angularFireStorage.ref(this.appName);
  constructor(
    private angularFireStorage : AngularFireStorage,
    private _db: DatabaseService,
    private _tool: ToolService
  ) { }

  saveAvatar(uid: string, file: File, privacy: string) {
    const ext: string = file.type.split('/')[1];
    const fileName: string = this._tool.getTime().toString() + '.' + ext;
    const path : string = this.appName + '/' + privacy + '/' + uid + '/' + fileName;
    return new Promise((res,rej) => {
      this.angularFireStorage.upload(path,file).then(() => {
        this.angularFireStorage.ref(path).getDownloadURL().subscribe(downloadURL => {
          this._db.addAvatar(uid, file, fileName, file.type, downloadURL).then(() => {
            res(null);
          }).catch(e => {
            rej(e);
          });
        })
      });
    })
  }
}