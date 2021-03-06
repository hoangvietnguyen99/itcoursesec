import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LsHelper } from '../helper/ls.helper';

@Injectable()
export class UserValidGuard implements CanActivate {
  constructor(private router: Router) {}

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const user = LsHelper.getUserFromStorage();
    if (user) {
      return true;
    } else {
      this.router.navigate(['']);
      return false;
    }
  }
}
