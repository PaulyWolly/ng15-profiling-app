import { Component, OnInit } from '@angular/core';

import { AccountService } from '@app/_services';

@Component({ templateUrl: 'details.component.html' })
export class DetailsComponent implements OnInit {
    account: any = null;

    constructor(private accountService: AccountService) { }

    ngOnInit() {
        this.accountService.account.subscribe(x => {
            console.log('Account updated:', x);
            this.account = x;
        });
    }
}
