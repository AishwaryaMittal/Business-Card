import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { LoginService } from './login.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private loginService: LoginService, private router: Router) {}

  //do verification
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    
        return this.loginService.user.pipe(
          take(1),
          map((user) => !!user),
          tap((loggedIn) => {
            if (!loggedIn) {
              console.log('access denied');
              this.router.navigate(['']);
            }
          })
        )
  }
}
