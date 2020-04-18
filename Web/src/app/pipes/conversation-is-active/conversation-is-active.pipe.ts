import { Pipe, PipeTransform } from '@angular/core';
import { ConversationModel } from 'src/app/models/model';

@Pipe({
  name: 'conversationIsActive'
})
export class ConversationIsActivePipe implements PipeTransform {

  transform(datas : ConversationModel[]) {
    return datas.filter(f => f?.messages?.length != 0);
  }
}