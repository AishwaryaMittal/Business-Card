import { Component, OnInit } from '@angular/core';
import { LoginService } from './login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string;
  password: string;

  // times out after 5 minutes
  timeout = 300000;
  timer: any;

  constructor(
    //should probably be called AuthService
    private loginService: LoginService,
    private router: Router,
  ) { }

  ngOnInit() {}

  startTimer() {
    this.timer = setTimeout(this.timeoutLogout.bind(this), this.timeout);
    console.log('Set timer for 5 minutes!');
  }

  timeoutLogout() {
    console.log('User has been logged in for 5 minutes. Logging out!')
    if (!this.loginService) {
      console.log('loginService is null');
    }
    this.loginService.signOut();
  }

  onLoginEmail(): void {
    //might do a regex to make sure @ and .com is included
    //might also validate email
    if (this.validateForm(this.email, this.password)) {
      this.emailLogin(this.email, this.password);
    }
  }

  validateForm(email: string, password: string): boolean {
    if (email.length === 0) {
      return false;
    }

    if (password.length === 0) {
      return false;
    }

    if (password.length < 6) {
      return false;
    }
    return true;
  }

  emailLogin(email: string, password: string) {
    this.startTimer();
    this.loginService.loginWithEmail(this.email, this.password)
        .then(() => this.router.navigate(['/dashboard']))
        .catch( error => {
          console.log(error);
          this.router.navigate(['/login']);
        });
  }
}
