import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { HistoryComponent } from './history/history.component';
import { LoginService } from './login/login.service';
import { DashboardService } from './dashboard/dashboard.service';
import { HttpModule } from '@angular/http';
import { WebcamModule } from 'ngx-webcam';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { firebaseConfig } from '../environments/environment';
import { AuthGuard } from './login/auth.guard';
import { HistoryGuard } from './history/history.guard';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    HistoryComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    FormsModule,
    HttpModule,
    WebcamModule
  ],
  providers: [
    LoginService, 
    DashboardService,
    AuthGuard,
    HistoryGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
