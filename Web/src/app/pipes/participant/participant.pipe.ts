import { Pipe, PipeTransform } from '@angular/core';
import { User, Participant } from 'src/app/models/model';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';

@Pipe({
  name: 'participant'
})
export class ParticipantPipe implements PipeTransform {

  constructor(private _authentication : AuthenticationService){}

  transform(data: Participant[]): any {
    const currentUser : User = this._authentication.currentUserValue;
    try {
      const user: User = data.find(p => p.user.userId != currentUser.userId).user;
      return user.firstname + ' ' + user.lastname;
    } catch (error) {
      return '';
    }
  }
}