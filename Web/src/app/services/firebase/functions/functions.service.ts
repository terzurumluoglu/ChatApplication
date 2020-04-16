import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../../toast/toast.service';
import { ErrorInterceptor } from 'src/app/helpers/error.interceptor';
// import 'rxjs/add/operator/map';
// @Injectable() export class TestService { pathDegerControl: string = 'api/test/degerControl/';
// constructor(@Inject('apiUrl') private apiUrl, private http: Http) { } doTest(data) { return this.http.get(this.apiUrl + this.pathDegerControl + data).map(r => r.json()); } }

@Injectable({
  providedIn: 'root'
})
export class FunctionsService {

  // url1: 'https://us-central1-chatapp-e09a8.cloudfunctions.net/createConversation?ownerId=4wf8ahEv7XRXWKgxKwlG3ra5pW23&userId=TXngiVlkATWweTgek42Wv80o0Is2';
  // url : 'https://us-central1-chatapp-e09a8.cloudfunctions.net/createConversation';

  pathGetUserByEmailAndPassword: string = 'getUserByEmailAndPassword/?';
  pathCreateConversation: string = 'createConversation';
  pathsendMessage: string = 'sendMessage';

  constructor(
    @Inject('apiUrl') private apiUrl,
    private http: HttpClient,
    private _error : ErrorInterceptor
  ) { }

  headers() : HttpHeaders{
    return new HttpHeaders().set('Content-Type', 'application/json');
  }

  createConversation(ownerId: string, userId: string) {
    const url : string = this.apiUrl + this.pathCreateConversation;
    const params = new HttpParams().set('ownerId', ownerId).set('userId', userId);
    const headers = this.headers();
    return this.http.get(url, { params, headers,responseType: 'text' }).pipe(catchError(this._error.handleError));
  }

  sendMessage(){
    
  }
}