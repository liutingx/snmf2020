import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BusService } from '../busService';
import { BusArrivalByCode } from '../models';

@Component({
  selector: 'app-bus-arrival-by-bus-stop-code',
  templateUrl: './bus-arrival-by-bus-stop-code.component.html',
  styleUrls: ['./bus-arrival-by-bus-stop-code.component.css']
})
export class BusArrivalByBusStopCodeComponent implements OnInit, OnDestroy{

  busArrival: BusArrivalByCode[] = []
  showAvailability: boolean = true;
  gotService: boolean = true;
  event$: Subscription
  busForm: FormGroup
  code;

  constructor(private busSvc: BusService, private activatedRoute: ActivatedRoute,
    private fb: FormBuilder, private router: Router) {
     }

  ngOnInit(): void {
    const busStopCode = parseInt(this.activatedRoute.snapshot.params['busStopCode'])
    const serviceNo = ''
    this.code = busStopCode
    this.busSvc.searchByBusStopCode({busStopCode, serviceNo})
    //subscribe to incoming messages
    this.event$ = this.busSvc.event.subscribe(data => {
      this.busArrival = data
      //console.log('bus arrivals', this.busArrival)
      this.busArrival.map(ea => {
        if(ea.nextBus.estimatedArrival < 1){
          ea.arriving = true;
        }
      })
    })
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.busSvc.leaveArrivalPage()
  }
}
