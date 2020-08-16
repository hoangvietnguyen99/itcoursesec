import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LsHelper } from '../app/helper/ls.helper';
import { User } from '../model/user';
import { catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class AuthenticateService {
  apiUrl = 'api/';
  constructor(private http: HttpClient) {}

  public login(email: string, password: string): Observable<User> {
    return this.http.post(this.apiUrl + 'login', { email, password }).pipe(
      map((res: User) => {
        LsHelper.saveUserToStorage(res);
        return res;
      })
    );
  }


  public registerUser(name, email, password): Observable<boolean> {
    return this.http
      .post(this.apiUrl + 'register', { name, email, password })
      .pipe(map((res: any) => res));
  }

  public authenticate(): Observable<User> {
    return this.http.get(this.apiUrl + '/Authenticate').pipe(
      map((res: User) => {
        LsHelper.saveUserToStorage(res);
        return res;
      })
    );
  }
}
