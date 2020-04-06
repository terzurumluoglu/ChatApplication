import { Pipe, PipeTransform } from '@angular/core';
import { ConversationModel } from 'src/app/models/model';

@Pipe({
  name: 'conversationsHasMessage'
})
export class ConversationsHasMessagePipe implements PipeTransform {

  transform(datas : ConversationModel[]) {
    console.log(datas);
    // let d = datas.filter(p => p.conversation.isActive === true);
    // console.log(d);
    // return d
  }
}