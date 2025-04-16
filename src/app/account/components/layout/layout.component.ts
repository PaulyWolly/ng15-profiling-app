import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/_services';

@Component({ templateUrl: 'layout.component.html' })
export class LayoutComponent implements OnInit {
    constructor(
        private router: Router,
        private accountService: AccountService
    ) {}

    ngOnInit() {
        // Check if token is valid before redirecting
        if (this.accountService.accountValue) {
            this.accountService.refreshToken()
                .pipe(first())
                .subscribe({
                    next: () => {
                        // Only redirect if token refresh was successful
                        this.router.navigate(['/']);
                    },
                    error: () => {
                        // If token refresh fails, user should stay on login page
                        this.accountService.logout();
                    }
                });
        }
    }
}