import { Pipe, PipeTransform } from '@angular/core';
import { User, Participant } from 'src/app/models/model';
import { AuthService } from 'src/app/services/firebase/auth/auth.service';

@Pipe({
  name: 'participant'
})
export class ParticipantPipe implements PipeTransform {

  constructor(private _auth : AuthService){}

  transform(data: Participant[]): any {
    const currentUserId : string = this._auth.getCurrentUserId();
    try {
      const user: User = data.find(p => p.user.userId != currentUserId).user;
      return user.firstname + ' ' + user.lastname;
    } catch (error) {
      return '';
    }
  }
}