import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../authService';
import { BusService } from '../busService';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css']
})
export class SearchPageComponent implements OnInit {

  searchForm: FormGroup
  loggedIn: boolean;

  constructor(private fb: FormBuilder, private busSvc: BusService, 
    private router: Router, private authSvc: AuthService) { }

  ngOnInit(): void {
    this.loggedIn = !!localStorage.getItem('accessToken')
    //console.log('logged in', this.loggedIn)
    this.searchForm = this.fb.group({
      busStopCode: this.fb.control('', Validators.required),
      serviceNo: this.fb.control('')
    })
  }

  searchArrival(){
    const busStopCode = this.searchForm.get('busStopCode').value
    const serviceNo = this.searchForm.get('serviceNo').value
    if(serviceNo){
      this.router.navigate([`/arrival/${busStopCode}/${serviceNo}`])
    }
    else{
      this.router.navigate([`/arrival/${busStopCode}`])
    }  
  }
}
