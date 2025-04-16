import { Component, OnInit } from '@angular/core';

import { AccountService } from '@app/_services';
import { Account } from '@app/_models';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
  account: Account | null = null;

  constructor(private accountService: AccountService) { }

  ngOnInit() {
    this.accountService.account.subscribe(x => {
      console.log('Account updated:', x);
      this.account = x;
    });
  }
} 