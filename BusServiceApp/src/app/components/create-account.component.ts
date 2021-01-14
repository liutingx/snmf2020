import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../authService';
import { NewUser } from '../models';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styles: [
  ]
})
export class CreateAccountComponent implements OnInit {

  showError = ''
  createAccountForm: FormGroup

  constructor(private authSvc: AuthService, private fb: FormBuilder,
    private router: Router) { }

  ngOnInit(): void {
    this.showError = ''
    this.createAccountForm = this.fb.group({
      username: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required]),
      email: this.fb.control('', [Validators.email, Validators.required])
    })
  }

  create(){
    const username = this.createAccountForm.get('username').value
    const password = this.createAccountForm.get('password').value
    const email = this.createAccountForm.get('email').value 
   
    this.authSvc.createAccount({username, email, password} as NewUser)
      .then(results => {        
          this.showError = this.authSvc.showError
      })
  }

}
