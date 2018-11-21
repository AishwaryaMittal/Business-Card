import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard/dashboard.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  events: any[];
  eventStrings: string[];

  constructor(private dashboardService: DashboardService) { 
   this.searchEventHistory();
  }

  searchEventHistory() {
    this.dashboardService.getEventHistory().subscribe( (events) => {
      var eventStrings = [];
      events.forEach(element => {
        eventStrings.push(element);
      });
      this.events = eventStrings;
      console.log("EVENTS EVENTS EVENTS");
      console.log(events);
      console.log("EVENTS EVENTS EVENTS");
    })
  }

  ngOnInit() {
  }
}
