import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../authService';
import { Login } from '../models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup
  showError = ''

  constructor(private authSvc: AuthService, private fb: FormBuilder,
    private router: Router) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: this.fb.control('', [Validators.required, Validators.email]),
      password: this.fb.control('', [Validators.required])
    })
  }

  login(){
    const email = this.loginForm.get('email').value
    const password = this.loginForm.get('password').value
    this.authSvc.loginAuthenticate({email, password} as Login)
      .then(() => {
        this.showError = this.authSvc.showError
      })
  }

  googleAuth(){
    window.open('/auth/google', "mywindow", "location=1,status=1,scrollbars=1, width=800,height=800")
    window.addEventListener('message', (message) => {
      localStorage.setItem('accessToken', message.data.token)
      localStorage.setItem('user', message.data.user)
      const token = message.data.token
      if(token != null){
        this.authSvc.loggedIn.next(!!localStorage.getItem('accessToken'))
        this.router.navigate(['/'])
      }
    })
  }
}
