import { Component } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';

import { AccountService } from './_services';
import { Account, Role } from './_models';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    Role = Role;
    account?: Account | null;

    constructor(
        private accountService: AccountService,
        private router: Router
    ) {
        this.accountService.account.subscribe(x => this.account = x);

        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationStart) {
                console.log('Router Event: NavigationStart', event.url);
            }
            if (event instanceof NavigationEnd) {
                console.log('Router Event: NavigationEnd', event.urlAfterRedirects);
            }
            if (event instanceof NavigationError) {
                console.error('Router Event: NavigationError', event.error);
            }
            if (event instanceof NavigationCancel) {
                console.log('Router Event: NavigationCancel', event.reason);
            }
        });
    }

    logout() {
        this.accountService.logout();
    }
}
