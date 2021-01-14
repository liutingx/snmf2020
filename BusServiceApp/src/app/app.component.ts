import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './authService';
import { BusService } from './busService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'BusServiceApp';

  user = ''
  loginText = 'Login';

  constructor(private router: Router, private authSvc: AuthService,
    private busSvc: BusService){}

  ngOnInit(): void {
    const loggedIn = localStorage.getItem('accessToken')
    this.loginText = loggedIn? 'Logout' : 'Login'
    this.user = localStorage.getItem('user')
    this.authSvc.loggedIn.subscribe((data) => {
      this.loginText = data? 'Logout' : 'Login'
      this.user = localStorage.getItem('user')
    })
  }

  toggleLogin(){
    //this.loginText = 'Logout'
    if(this.loginText == 'Login'){
      this.router.navigate(['/login'])
    }
    else{
      this.busSvc.logout()
    }
    
  }

}
