import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthService } from './authService';
import { BookmarkBusStopCodeComponent } from './components/bookmark-bus-stop-code.component';
import { BookmarkCreateComponent } from './components/bookmark-create.component';
import { BookmarkEditComponent } from './components/bookmark-edit.component';
import { BusArrivalByBusStopCodeAndServiceNoComponent } from './components/bus-arrival-by-bus-stop-code-and-service-no.component';
import { BusArrivalByBusStopCodeComponent } from './components/bus-arrival-by-bus-stop-code.component';
import { BusServicesInfoComponent } from './components/bus-services-info.component';
import { BusServicesListComponent } from './components/bus-services-list.component';
import { CreateAccountComponent } from './components/create-account.component';
import { LoginComponent } from './components/login.component';
import { MainComponent } from './components/main.component';
import { ProfileComponent } from './components/profile.component';
import { SearchPageComponent } from './components/search-page.component';

const routes: Routes = [
  {path: '', component: MainComponent},
  {path: 'login', component: LoginComponent},
  {path: 'search', component: SearchPageComponent},
  {path: 'createAccount', component: CreateAccountComponent},
  {path: 'busServices', component: BusServicesListComponent},
  {
    path: 'bookmarks', 
    component: BookmarkBusStopCodeComponent,
    canActivate: [AuthService]
  },
  {
    path: 'bookmarks/create', 
    component: BookmarkCreateComponent,
    canActivate: [AuthService]
  },
  {
    path: 'bookmarks/edit/:bookmark_id', 
    component: BookmarkEditComponent,
    canActivate: [AuthService]
  },
  {
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [AuthService]
  },
  {path: 'busServices/:serviceNo', component: BusServicesInfoComponent},
  {path: 'arrival/:busStopCode', component: BusArrivalByBusStopCodeComponent},
  {path: 'arrival/:busStopCode/:serviceNo', component: BusArrivalByBusStopCodeAndServiceNoComponent},
  {path: '**', redirectTo: '/', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
