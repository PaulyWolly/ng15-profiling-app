import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/_services';

@Component({ 
  templateUrl: 'overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
  constructor(
    private accountService: AccountService
  ) {}

  ngOnInit() {
    // Initialize the overview dashboard
    console.log('Admin overview dashboard initialized');
  }
}