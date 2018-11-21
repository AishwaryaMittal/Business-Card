import { Component, OnInit } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { Http } from '@angular/http';
import { googleVision } from '../../environments/environment';
import { Card } from '../card';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { WebcamImage } from 'ngx-webcam';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  savedCards: Card[];
  inDatabase: boolean = false;
  webcamActivated: boolean = false;
  photoTaken: boolean = false;
  photoDeleted: boolean = false;
  textDetectionDone: boolean = false;
  photoSaved: boolean = false;
  searched: boolean = false;
  nullSearch: boolean = false;
  searchContainer: boolean = false;
  addContainer: boolean = false;
  trigger: Subject<void> = new Subject<void>();
  webcamImage: WebcamImage;
  base64: string;
  dataUrl: string;
  textElementsByArea: Array<any>;
  jsonObject: any;
  firstName: string;
  lastName: string;
  cardToAdd = new Card();

  constructor(
    private dashboardService: DashboardService, 
    private http: Http,
  ) { }
    
  ngOnInit() {
    this.dashboardService.getSavedCards().subscribe( (results) => {
      console.log("SAVED CARDS");
      console.log(results);
      console.log("SAVED CARDS");
      this.savedCards = results;
    })
  }

  activateWebcam() {
    this.webcamActivated = true;
  }

  deactivateWebcam() {
    this.webcamActivated = false;
  }

  takePhoto() {
    this.trigger.next();
    this.deactivateWebcam();
    this.photoDeleted = false;
    this.photoTaken = true;
    this.textDetection();
  }

  removePhoto() {
    this.webcamImage = null;
    this.dataUrl = '';
    this.base64 = '';
    this.photoDeleted = true;
    this.webcamActivated = true;
    this.photoTaken = false;
  }

  public captureImage(webcamImage: WebcamImage): void {
    console.log('Captured photo', webcamImage);
    this.webcamImage = webcamImage;
    this.dataUrl = this.webcamImage.imageAsDataUrl;
    this.base64 = this.webcamImage.imageAsBase64;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  textDetection() {
    this.photoSaved = false;
    console.log("TEXTDETECTION method");
    const request: any = {
      'requests': [
        {
          'image': {
            'content': this.base64,
          },
          'features': [
            {
              'type': 'TEXT_DETECTION',
              'maxResults': 1,
            }
          ]
        }
      ]
  };
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${googleVision}`;
  this.http.post(
    url,
    request
  ).subscribe( (results: any) => {
    console.log('RESULTS RESULTS RESULTS');
    console.log(results.json());
    console.log('RESULTS RESULTS RESULTS');

    this.cardToAdd = this.parseText(results.json());
    this.textDetectionDone = true;
  });
}

  addCardToDatabase() {
    // check database to see if card is already there
    this.inDatabase = this.searchCardsByEmail(this.cardToAdd.email);
    // fix booleans touched by searchCardsByEmail
    this.nullSearch = false;
    this.searched = false;
    if (!this.inDatabase) {
      // card isn't in database; we should add it
      this.addCardToDB(this.cardToAdd);
      console.log('Adding card for ' + this.cardToAdd.email + ' to database.');
      this.photoSaved = true;
      this.toggleAdd();
    } else {
      // card is already in database; we don't need to add it
      console.log('Didn\'t add card to database. Card for ' + this.cardToAdd.email + ' already in database.');
    }
  }

  parseText(cardTexts: any): Card {

    var text: string = cardTexts.responses[0].textAnnotations[0].description;
    console.log('TEXT READ FROM CARD');
    console.log(text);
    console.log('TEXT READ FROM CARD');
    var card = new Card();
    var splitText = text.split('\n');
    // name is likely on the first line of the card
    var probableName = splitText[0].split(' ');
    // split name into first and last name
    card.firstName = probableName[0];
    card.lastName = probableName[1];
    card.phoneNumber = this.getPhoneNumber(text);
    card.email = this.getEmailAddress(text);
    // dump all other text into additional text
    card.additionalText = splitText[1];
    card.imageUri = this.dataUrl;
    return card;
  }

  getEmailAddress(cardText: string): string {
    // from https://stackoverflow.com/questions/9020261/why-doesnt-this-particular-regex-work-in-javascript
    var regex = new RegExp(/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/, 'g');
    var result = regex.exec(cardText);
    console.log('got email from image: ' + result);
    return result !== null ? result[0] : '';
  }

  getPhoneNumber(cardText: string): string {
    // from http://regexlib.com/Search.aspx?k=phone
    var regex = new RegExp(/((\d)\D)?(\(?(\d\d\d)\)?)?\D(\d\d\d)\D(\d\d\d\d)/, 'g');
    var result = regex.exec(cardText);
    console.log('got phone number from image: ' + result);
    return result !== null ? result[0] : '';
  }

  addCardToDB(card: Card) {
    this.dashboardService.addCard(card);
    this.dashboardService.logEvent(`Added business card for ${card.email}`);
  }

  getSavedCards() {
    this.dashboardService.getSavedCards();
  }

  searchCardsByName(firstName: string, lastName: string) {
    this.nullSearch = false;
    this.dashboardService.logEvent(`Searched cards for ${firstName} ${lastName}`);
    this.searched = true;
    for (let card of this.savedCards) {
      if (card.firstName == firstName) {
        if (card.lastName == lastName) {
          console.log(`found match for ${firstName} ${lastName}`);
          this.savedCards = []
          this.savedCards.push(card);
          return;
        }
      }
      console.log(`didn't find match for ${firstName} ${lastName}`);
      this.nullSearch = true;
    }
  }

  searchCardsByEmail(email: string) {
    this.nullSearch = false;
    this.dashboardService.logEvent(`Searched cards for ${email}`);
    this.searched = true;
    for (let card of this.savedCards) {
      if (card.email == email) {
        console.log(`found match for ${email}`);
        this.savedCards = [];
        this.savedCards.push(card);
        return true;
      }
    }
    console.log(`didn't find match for ${email}`);
    this.nullSearch = true;
    return false;
  }

  clearSearch() {
    console.log('Clearing search...');
    this.dashboardService.getSavedCards().subscribe( (results) => {
      this.savedCards = results;
    });
    this.searched = false;
    this.nullSearch = false;
  }

  toggleSearch(){
    this.searchContainer = !this.searchContainer;
    this.addContainer = false;
  }

  toggleAdd(){
    this.searchContainer = false;
    this.addContainer = !this.addContainer;
  }
}