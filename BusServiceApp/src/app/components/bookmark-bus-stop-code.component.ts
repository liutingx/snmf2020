import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookmarkService } from '../bookmarkService';

@Component({
  selector: 'app-bookmark-bus-stop-code',
  templateUrl: './bookmark-bus-stop-code.component.html',
  styleUrls: ['./bookmark-bus-stop-code.component.css']
})
export class BookmarkBusStopCodeComponent implements OnInit {

  bookmarksList = []

  constructor(private bookmarkSvc: BookmarkService, private router: Router) { 
  }

  ngOnInit(): void {
    this.fetchBookmarks()
  }

  fetchBookmarks(){
    this.bookmarkSvc.getBookmarks()
      .then(results => {
        //console.log('wadever bookmarks', results)
        this.bookmarksList = results
      })
  }

  bookmark(event){
    //console.log('bookmarking', event.bookmark_id)
    if(confirm('Sure to unbookmark?')){
      event.bookmarked = !event.bookmarked
      //console.log('go unbookmark')
      this.bookmarkSvc.removeBookmark(event.bookmark_id)
        .then(results => {
          //console.log('bookmark removed')
          this.fetchBookmarks()
        })
    }
  }
}
