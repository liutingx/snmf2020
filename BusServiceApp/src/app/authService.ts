import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Subject } from "rxjs";
import { Login, NewUser } from "./models";

@Injectable()
export class AuthService implements CanActivate{

    showError = ''
    loggedIn = new Subject<boolean>()
    private token = ''

    constructor(private http: HttpClient, private router: Router){}

    loginAuthenticate(userInfo: Login):Promise<any>{
        this.token = ''
        return this.http.post<any>('/login', userInfo, {observe: 'response'})
            .toPromise()
            .then(resp => {
                if(resp.status == 200){
                    localStorage.setItem('accessToken', resp.body.token);
                    localStorage.setItem('user', resp.body.user)
                    this.loggedIn.next(!!localStorage.getItem('accessToken'))
                }
                //console.log('resp', resp)
                this.router.navigate(['/home'])
            })
            .catch(err => {
                if(err.status == 403){
                    //handle error
                    this.showError = 'Email/Password is incorrect'
                }
                return false
            })
    }

    createAccount(newUser: NewUser): Promise <any>{
        //console.log('create', newUser)
        return this.http.post<any>('/createUser', newUser, {observe: 'response'})
            .toPromise()
            .then(resp => {
                if(resp.status == 200){
                    //console.log('account created')
                    alert('Account created, please log in')
                    this.router.navigate(['/login'])
                }
                //console.log('resp', resp)
                
            })
            .catch(err => {
                if(err.status == 409){
                    this.showError = 'You have an account with us, please sign in!'
                    //handle error
                }
                return false
            })
    }

    isLogin() {
        this.token = localStorage.getItem('accessToken')
        //console.log('token', this.token)
        return this.token != null
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
        if(this.isLogin()){
            return true
        }      
        alert('Please login or register to access!')
        return this.router.parseUrl('/login')
    }
}