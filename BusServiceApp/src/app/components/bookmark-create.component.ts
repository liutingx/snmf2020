import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookmarkService } from '../bookmarkService';

@Component({
  selector: 'app-bookmark-create',
  templateUrl: './bookmark-create.component.html',
  styleUrls: ['./bookmark-create.component.css']
})
export class BookmarkCreateComponent implements OnInit {

  edit:boolean = false
  busStopInfo = []
  bookmarkForm: FormGroup
  description = ''
  roadName = ''
  showError = ''
  valid: boolean = false

  constructor(private bookmarkSvc: BookmarkService, private fb: FormBuilder,
    private router: Router) { }

  ngOnInit(): void {
    this.bookmarkSvc.getBusStopInfo()
      .then(results => {
        //console.log('bookmark busstop', results)
        this.busStopInfo = results
      })

    this.bookmarkForm = this.fb.group({
      busStopCode: this.fb.control('', [Validators.required]),
      description: this.fb.control('', [Validators.required])
    })
  }

 /*  canILeave(){
    return (!this.bookmarkForm.dirty)
  } */

  selectedBusCode(e){
    try{
      const busStopCode = parseInt(e.target.value)
      //console.log('selected', busStopCode)

      const exists = this.busStopInfo.find(each => each.BusStopCode == busStopCode)
      this.description = exists.Description
      this.roadName = exists.RoadName
      this.bookmarkForm.get('description').patchValue(this.description)
      //console.log('this', this.roadName)
      this.valid = true
    }
    catch(e){
      //console.log('err', e)
      this.valid = false
      this.showError = 'No such Bus Stop Code'
    }
    
  }

  bookmark(){
    const busStopCode = this.bookmarkForm.get('busStopCode').value
    const roadName = this.roadName
    const description = this.bookmarkForm.get('description').value
    //console.log('bookmarking', busStopCode, roadName, description)
    this.bookmarkSvc.createBookmark({busStopCode, roadName, description})
      .then(results => {
        //console.log('passed bookmark to express', results)
        this.router.navigate(['/bookmarks'])
      })
  }

}
