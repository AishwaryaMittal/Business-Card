import { Injectable } from '@angular/core';
import { LoginService } from '../login/login.service';
import { AngularFireDatabase } from '@angular/fire/database';
import { mergeMap } from 'rxjs/operators/';

@Injectable()
export class DashboardService {
  eventHistoryRef: any;
  savedCardsRef: any;
  
  constructor(private loginService: LoginService, private db: AngularFireDatabase) {

    this.eventHistoryRef = this.db.list(`currentSession/${this.loginService.userUid}/searches`);
    this.savedCardsRef = this.db.list(`users/${this.loginService.userUid}/savedCards`);
    console.log("DASHBOARD SERVICE CONSTRUCTOR");
  }

  getEventHistory() {
    return this.eventHistoryRef.valueChanges();
  }

  logEvent(event: string) {
    var timestamp = Date.now()
    var dateString = new Date(timestamp).toLocaleDateString("en-US")
    var timeString = new Date(timestamp).toLocaleTimeString("en-US");
    this.eventHistoryRef.push(`${dateString} ${timeString}: ${event}`);
  }

  getSavedCards() {
    return this.savedCardsRef.valueChanges();
  }

  searchFullName(firstName: string, lastName: string) { 
    return this.db.object(`users/${this.loginService.userUid}/savedCards/firstName/${firstName}`).valueChanges().pipe( 
        mergeMap(_ => this.db.object(`users/${this.loginService.userUid}/savedCards/lastName/${lastName}`).valueChanges(),
                (first, last) => { 
                if (first && last) { 
                    return true; 
                } 
                if (!first && !last) { 
                    throw Error("The first and last names were not found.") 
                } 
                if (!first) { 
                    throw Error("The first name was not found.") 
                } 
                if (!last) { 
                    throw Error("The last name was not found.") 
                } 
        })
    ) 
} 

  addCard(card: any) {
    this.savedCardsRef.push(card);
  }
}
