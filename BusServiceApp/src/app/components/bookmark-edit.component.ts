import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookmarkService } from '../bookmarkService';

@Component({
  selector: 'app-bookmark-edit',
  templateUrl: './bookmark-create.component.html',
  styleUrls: ['./bookmark-create.component.css']
})
export class BookmarkEditComponent implements OnInit {

  edit:boolean = true
  busStopInfo = []
  bookmarkForm: FormGroup
  description = ''
  roadName = ''
  showError = ''
  busStopCode = ''
  valid: boolean = false

  constructor(private bookmarkSvc: BookmarkService, private fb: FormBuilder,
    private router: Router, private activateRoute: ActivatedRoute) { }

  ngOnInit(): void {
    const bookmark_id = this.activateRoute.snapshot.params['bookmark_id']
    this.bookmarkSvc.getBusStopInfo()
      .then(results => {
        //console.log('bookmark busstop', results)
        this.busStopInfo = results
      })
    
    this.bookmarkSvc.getOneBookmark(bookmark_id)
      .then(results => {
        this.roadName = results.roadName
        //console.log('get one bookmark', results)
        this.bookmarkForm.get('busStopCode').patchValue(results.busStopCode)
        this.bookmarkForm.get('description').patchValue(results.description)
      })

    this.bookmarkForm = this.fb.group({
      busStopCode: this.fb.control('', [Validators.required]),
      description: this.fb.control('', [Validators.required])
    })
  }

  selectedBusCode(e){
    try{
      const busStopCode = parseInt(e.target.value)
      //console.log('selected', busStopCode)

      const exists = this.busStopInfo.find(each => each.BusStopCode == busStopCode)
      this.description = exists.Description
      this.roadName = exists.RoadName
      this.bookmarkForm.get('description').patchValue(this.description)
      //console.log('this', this.roadName)
      this.valid = false
    }
    catch(e){
      //console.log('err', e)
      this.valid = true
      this.showError = 'No such Bus Stop Code'
    }
  }

  editBookmark(){
    const bookmark_id = this.activateRoute.snapshot.params['bookmark_id']
    const busStopCode = this.bookmarkForm.get('busStopCode').value
    const roadName = this.roadName
    const description = this.bookmarkForm.get('description').value
    //console.log('bookmarking', busStopCode, roadName, description)
    this.bookmarkSvc.editBookmark({bookmark_id, busStopCode, roadName, description})
      .then(results => {
        //console.log('passed bookmark to express', results)
        this.router.navigate(['/bookmarks'])
      })
  }

}