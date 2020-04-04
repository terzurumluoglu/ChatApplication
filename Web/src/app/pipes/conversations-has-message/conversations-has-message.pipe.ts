import { Pipe, PipeTransform } from '@angular/core';
import { ConversationModel } from 'src/app/models/model';

@Pipe({
  name: 'conversationsHasMessage'
})
export class ConversationsHasMessagePipe implements PipeTransform {

  transform(datas : ConversationModel[]): unknown {
    return datas.filter(p => p.messages.length != 0);
  }

}
