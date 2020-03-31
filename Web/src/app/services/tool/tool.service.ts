import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl, SafeStyle} from '@angular/platform-browser';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ToolService {

  constructor(private _sanitizer : DomSanitizer) { }

  generateGUID() {
    return uuidv4();
  }

  getTime(): number{
    let time: Date = new Date();
    return time.getTime();
  }
  

  // generateSafeUrl(url : string) : SafeUrl{
  //   return this._sanitizer.bypassSecurityTrustUrl(url);
  // }

  // generateSafeStyle(url : string) : SafeStyle{
  //   let styleUrl = "url(" + url + ")";
  //   return this._sanitizer.bypassSecurityTrustStyle(styleUrl);
  // }
}
