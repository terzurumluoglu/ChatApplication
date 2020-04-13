import { Pipe, PipeTransform } from '@angular/core';
import { User, Participant } from 'src/app/models/model';
import { AuthService } from 'src/app/services/firebase/auth/auth.service';

@Pipe({
  name: 'participant'
})
export class ParticipantPipe implements PipeTransform {

  constructor(private _auth : AuthService){}

  transform(data: Participant[]): Participant {
    const currentUserId : string = this._auth.getCurrentUserId();
    try {
      const a = data.find(p => p.user.userId != currentUserId);
      return a
    } catch (error) {
      return null;
    }
  }
}