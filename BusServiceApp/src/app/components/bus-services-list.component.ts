import { Component, OnInit } from '@angular/core';
import { AuthService } from '../authService';
import { BookmarkService } from '../bookmarkService';
import { BusService } from '../busService';

@Component({
  selector: 'app-bus-services-list',
  templateUrl: './bus-services-list.component.html',
  styleUrls: ['./bus-services-list.component.css']
})
export class BusServicesListComponent implements OnInit {

  busServices = []

  constructor(private busSvc: BusService, private bookmarkSvc: BookmarkService,
    private authSvc: AuthService) { }

  ngOnInit(): void {
    this.busSvc.getBusServicesList()
      .then((results) => {
        this.busServices = results
        //console.log('bus services', results)
      })
      .catch(err => console.log(err))
  }
}
