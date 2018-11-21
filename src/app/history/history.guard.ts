import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../login/login.service';
import { map, take, tap } from 'rxjs/operators';

@Injectable()
export class HistoryGuard implements CanActivate {

  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      
      return this.loginService.adminUser.pipe(
        take(1),
        map((user => !!user),
        tap((isAdmin) => {
          if (!isAdmin) {
            console.log('access denied');
            this.router.navigate(['']);
          }
        })
      ))
  }
}
