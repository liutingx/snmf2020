import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../authService';
import { BusService } from '../busService';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  form: FormGroup
  loggedIn: boolean;

  constructor(private fb: FormBuilder, private busSvc: BusService, 
    private router: Router, private authSvc: AuthService) { }

  ngOnInit(): void {
    this.busSvc.leaveArrivalPage()
    this.loggedIn = !!localStorage.getItem('accessToken')
    //console.log('logged in', this.loggedIn)
    this.form = this.fb.group({
      busStopCode: this.fb.control('', Validators.required)
    })
  }

  async searchArrival(){
    const busCode = this.form.get('busStopCode').value
    await this.busSvc.searchByBusStopCode(busCode)
    this.router.navigate([`/arrival/${busCode}`])
  }

  logout(){
    this.busSvc.logout()
  }
}
