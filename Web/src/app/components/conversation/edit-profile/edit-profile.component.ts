import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Update,User, UserModel } from 'src/app/models/model';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DatabaseService } from 'src/app/services/firebase/database/database.service';
import { StorageService } from 'src/app/services/firebase/storage/storage.service';
import { ErrorInterceptor } from 'src/app/helpers/error.interceptor';
import { AuthService } from 'src/app/services/firebase/auth/auth.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {

  privacy: boolean =false;
  userModel: UserModel;
  profileForm: FormGroup;
  selectedFile : any;
  base64 : string = '';
  currentUserId : string;
  constructor(
    private cd: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private _auth : AuthService,
    private _db: DatabaseService,
    private _error : ErrorInterceptor,
    private _storage : StorageService
  ) {
    this.main();
  }
  ngOnInit(): void {
  }
  main(){
    this.userModel = JSON.parse(localStorage.getItem('userModel'));
    this.currentUserId = this.userModel.user.userId;
    this.privacy = this.userModel.user.settings.isPrivate;
    this.base64 = this.userModel.user.avatar.downloadURL;
    this.createForm();
  }
  
  changePrivacy(selectedPrivacy: boolean) {
    this.privacy = selectedPrivacy;
    this._db.updateUserDataByUserId(this.currentUserId, 'settings.privacy', selectedPrivacy).then(() => {
      // Success
      this.userModel.user.settings.isPrivate = selectedPrivacy;
      localStorage.setItem('userModel', JSON.stringify(this.userModel));
    }).catch(e => {
      // Fail
      this.privacy = !selectedPrivacy;
    });
  }
  
  createForm() {
    let filename : string;
    this.profileForm = this.formBuilder.group({
      firstname: [this.userModel.user.firstname, Validators.required],
      lastname: [this.userModel.user.lastname, Validators.required],
      avatar: [null, [Validators.required]],
      imageValidator: [filename, Validators.required],
      bio: [this.userModel.user.bio,[]],
    });
  }
  
  onSelectFile(event) {
    if (event.target.files && event.target.files.length) {
      const file: File = event.target.files[0];
      let type: string = file.type.split('/')[1];
      const reader = new FileReader();
      this.profileForm.controls['imageValidator'].setValue(file ? file.name : null);
      if (type == 'png' || type == 'jpg' || type == 'jpeg') {
        this.selectedFile = file;
        reader.readAsDataURL(file);
        reader.onload = (e: any) => {
          this.base64 = e.target.result.toString();
          this.cd.markForCheck();
        };
      }
    }
  }

  get f() { return this.profileForm.controls; }

  onSubmit() {
    const datas : Update[] = this.createUpdateList();
    datas.forEach(element => {
      if (element.key == 'avatar') {
        this._storage.saveAvatar(this.currentUserId,element.value,'personal').then(() => {
          this._error.success('Success','Your Profile was updated');
        }).catch(e => {
          this._error.handleError(e);
        });
      }
      else{
        this._db.updateUserDataByUserId(this.currentUserId,element.key,element.value).then(() => {
          this._error.success('Success','Your Profile was updated');
        }).catch(e => {
          this._error.handleError(e);
        });;
      }
    });
  }

  createUpdateList() : Update[]{
    
    const datas : Update[] = [];

    if (this.f.firstname && this.f.firstname.value != this.userModel.user.firstname) {
      const data : Update = new Update('firstname',this.f.firstname.value);
      datas.push(data);
    }
    if (this.f.lastname.valid && this.f.lastname.value != this.userModel.user.lastname) {
      const data : Update = new Update('lastname',this.f.lastname.value);
      datas.push(data);
    }
    if (this.f.imageValidator.valid === true) {
      const data : Update = new Update('avatar',this.selectedFile);
      datas.push(data);
    }
    if (this.f.bio.value != this.userModel.user.bio) {
      const data : Update = new Update('bio',this.f.bio.value);
      datas.push(data);
    }
    return datas;
  }
}
