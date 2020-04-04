import { Injectable } from '@angular/core';
import { ToolService } from '../../tool/tool.service';
import { DatabaseService } from '../database/database.service';
import { AngularFireStorage, AngularFireStorageReference } from "angularfire2/storage";
import * as firebase from "firebase/app";
import 'firebase/storage';
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  appName: 'ChatApplication';
  ref : AngularFireStorageReference = this.angularFireStorage.ref(this.appName);
  constructor(
    private angularFireStorage : AngularFireStorage,
    private _db: DatabaseService,
    private _tool: ToolService
  ) { }

  saveAvatar(uid: string, file: File, privacy: string) {
    const ext: string = file.type.split('/')[1];
    const fileName: string = this._tool.getTime().toString() + '.' + ext;
    return new Promise((res,rej) => {
      this.ref.child(privacy).child(uid).child(fileName).put(file, { contentType: file.type }).then(() => {
        this.getPhotoUrl(uid,privacy, fileName).then(downloadURL => {
          this._db.addAvatar(uid, file, fileName, file.type, downloadURL).then(() => {
            res(null);
          }).catch(e => {
            rej(e);
          });
        }).catch(e => {
          rej(e);
        });
      }).catch(e => {
        rej(e);
      });
    })
  }

  getPhotoUrl(uid:string,privacy: string, fileName: string): Promise<string> {
    return new Promise((res, rej) => {
      this.ref.child(privacy).child(uid).child(fileName).getDownloadURL().then(p => {
        res(p);
      }).catch(err => {
        rej(err)
      });
    });
  }
}
