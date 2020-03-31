import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import 'rxjs/add/operator/map';
// @Injectable() export class TestService { pathDegerControl: string = 'api/test/degerControl/';
// constructor(@Inject('apiUrl') private apiUrl, private http: Http) { } doTest(data) { return this.http.get(this.apiUrl + this.pathDegerControl + data).map(r => r.json()); } }

@Injectable({
  providedIn: 'root'
})
export class FunctionsService {

  pathGetUserByEmailAndPassword: string = 'getUserByEmailAndPassword/?';

  constructor(
    @Inject('apiUrl') private apiUrl,
    private http: HttpClient
  ) { }
}