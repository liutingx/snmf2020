import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './components/main.component';
import { BusArrivalByBusStopCodeComponent } from './components/bus-arrival-by-bus-stop-code.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BusService } from './busService';
import { LoginComponent } from './components/login.component';
import { CreateAccountComponent } from './components/create-account.component';
import { AuthService } from './authService';
import { SearchPageComponent } from './components/search-page.component';
import { BusServicesListComponent } from './components/bus-services-list.component';
import { BusServicesInfoComponent } from './components/bus-services-info.component';
import { BookmarkService } from './bookmarkService';
import { BookmarkBusStopCodeComponent } from './components/bookmark-bus-stop-code.component';
import { BusArrivalByBusStopCodeAndServiceNoComponent } from './components/bus-arrival-by-bus-stop-code-and-service-no.component';
import { BookmarkCreateComponent } from './components/bookmark-create.component';
import { BookmarkEditComponent } from './components/bookmark-edit.component';
import { ProfileComponent } from './components/profile.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    BusArrivalByBusStopCodeComponent,
    LoginComponent,
    CreateAccountComponent,
    SearchPageComponent,
    BusServicesListComponent,
    BusServicesInfoComponent,
    BookmarkBusStopCodeComponent,
    BusArrivalByBusStopCodeAndServiceNoComponent,
    BookmarkCreateComponent,
    BookmarkEditComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    BusService,
    AuthService,
    BookmarkService,
    BookmarkService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
