import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService } from './authService';
import { BusArrivalByCode } from './models';

@Injectable()
export class BusService {

    constructor(private http: HttpClient, private authSvc: AuthService,
        private router: Router){}

    private socket: WebSocket
    event = new Subject<BusArrivalByCode[]>()

    searchByBusStopCode({busStopCode, serviceNo}){
        const userToken = localStorage.getItem('accessToken')
        const params = new HttpParams()
            .set('username', userToken || 'guest')
            .set('serviceNo', serviceNo || '')
        const url = `ws://localhost:3000/arrival/${busStopCode}?${params.toString()}`
        //console.log('url', url)
        this.socket = new WebSocket(url)
        //this.socket.send('close and start again')
                
        //handle incoming message
        this.socket.onmessage = (payload: MessageEvent) => {
            //parse the string to ChatMessage
            const data = JSON.parse(payload.data) as BusArrivalByCode[]
            //console.log('svc', data)
            this.event.next(data)
        }
        //handle accidental socket error (connection ended by other party)
        this.socket.onclose = (() => {
            //console.log('server close')
            if(this.socket != null){
                //console.log('client close')
                this.socket.close()
                this.socket = null
            }
        }).bind(this)  
    }

    getBusServicesList(): Promise<any>{
        return this.http.get<BusService[]>('/busServices')
            .toPromise()
    }

    getBusServices(serviceNo: string): Promise<any>{
        return this.http.get<any>(`/busServices/${serviceNo}`)
            .toPromise()
    }

    leaveArrivalPage(){
        
        if(this.socket != null){
            //console.log('client leave arrival')
            this.socket.close()
            this.socket = null
        }
    }

    //leaving connection on our own
    logout(){
        this.leaveArrivalPage()
        localStorage.clear()
        this.authSvc.loggedIn.next(!!localStorage.getItem('accessToken'))
        //this.authSvc.loggedIn = false
        this.router.navigate(['/'])
    }
}