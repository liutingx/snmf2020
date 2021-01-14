import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BusService } from '../busService';

@Component({
  selector: 'app-bus-services-info',
  templateUrl: './bus-services-info.component.html',
  styleUrls: ['./bus-services-info.component.css']
})
export class BusServicesInfoComponent implements OnInit {

  busServiceInfo = []
  serviceNo;
  constructor(private activatedRoute: ActivatedRoute, private busSvc: BusService) { }

  ngOnInit(): void {
    this.serviceNo = this.activatedRoute.snapshot.params['serviceNo']
    this.busSvc.getBusServices(this.serviceNo)
      .then(results => {
        this.busServiceInfo.push(...results)
        //console.log(this.busServiceInfo)
      })
      .catch(err => console.log(err))
    }

}
