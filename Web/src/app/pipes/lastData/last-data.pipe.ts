import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lastData'
})
export class LastDataPipe implements PipeTransform {

  transform(datas : any[],param : string): any {
    try {
      return datas[datas.length-1][param];
    } catch (error) {
      return '';
    }
  }
}