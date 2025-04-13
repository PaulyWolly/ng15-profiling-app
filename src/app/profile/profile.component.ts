import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/_services';
import { Account } from '@app/_models';

@Component({
    templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
    account: Account | null = null;

    constructor(private accountService: AccountService) { }

    ngOnInit() {
        this.accountService.account.subscribe(x => {
            this.account = x;
        });
    }
} 