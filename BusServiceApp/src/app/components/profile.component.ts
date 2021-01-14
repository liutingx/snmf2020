import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BusService } from '../busService';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router,
    private busSvc: BusService) { }

  ngOnInit(): void {
  }

  deleteAccount(){
    if(confirm('Are you sure on deleting the account? All bookmarks will be removed.')){
      const userToken = localStorage.getItem('accessToken')
      const headers = (new HttpHeaders())
              .set('Authorization', `Bearer ${userToken}`)
      this.http.delete<any>(`/delete`, { headers, observe: 'response' })
        .toPromise()
        .then(resp => {
          if(resp.status == 200){
            alert('Account have been deleted.')
            this.busSvc.logout()
          }
        })
        .catch(err => {
            return false
        })
    }
    
  }

}
