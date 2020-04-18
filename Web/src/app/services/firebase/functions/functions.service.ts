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

  pathGetUserByEmailAndPassword: string = 'getUserByEmailAndPassword/?';
  pathCreateConversation: string = 'createConversation';
  pathsendMessage: string = 'sendMessage';
  pathReadMessage : string = 'readMessage';
  pathAddDevice : string = 'addDevice';

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
    const headers : HttpHeaders = this.headers();
    return this.http.get(url, { params, headers,responseType: 'text' }).pipe(catchError(this._error.handleError));
  }

  sendMessage(ownerId : string,conversationId : string,messageContent : string){
    const url : string = this.apiUrl + this.pathsendMessage;
    const params = new HttpParams().set('ownerId', ownerId).set('conversationId', conversationId).set('messageContent', messageContent);
    const headers : HttpHeaders = this.headers();
    return this.http.get(url,{params,headers,responseType : 'json'}).pipe(catchError(this._error.handleError));
  }

  readMessage(ownerId : string,conversationId : string){
    const url : string = this.apiUrl + this.pathReadMessage;
    const headers : HttpHeaders = this.headers();
    const params = new HttpParams().set('ownerId', ownerId).set('conversationId', conversationId);
    return this.http.get(url,{params,headers,responseType : 'json'}).pipe(catchError(this._error.handleError)).subscribe();
  }

  addDevice(ownerId: string, token: string) {
    const url : string = this.apiUrl + this.pathAddDevice;
    const headers : HttpHeaders = this.headers();
    const params = new HttpParams().set('ownerId', ownerId).set('token', token);
    return this.http.get(url,{params,headers,responseType : 'json'}).pipe(catchError(this._error.handleError)).subscribe();
  }
}