import { Pipe, PipeTransform } from '@angular/core';
import { ConversationModel } from 'src/app/models/model';

@Pipe({
  name: 'conversationIsActive'
})
export class ConversationIsActivePipe implements PipeTransform {

  transform(datas : ConversationModel[]) {
    let d = datas.filter(p => p.conversation.isActive === true);
    return d
  }
}