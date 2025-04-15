import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AccountService } from '@app/_services';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private accountService: AccountService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const account = this.accountService.accountValue;
        console.log('AuthGuard: Checking activation for', state.url);
        if (account) {
            console.log('AuthGuard: Account found', { id: account.id, role: account.role });
            // check if route is restricted by role
            if (route.data.roles) {
                console.log('AuthGuard: Route requires roles:', route.data.roles);
                if (!route.data.roles.includes(account.role)) {
                    // role not authorized so redirect to home page
                    console.log(`AuthGuard: Role '${account.role}' NOT authorized. Redirecting to /`);
                    this.router.navigate(['/']);
                    return false;
                }
                 console.log(`AuthGuard: Role '${account.role}' IS authorized.`);
            }

            // authorized so return true
            console.log('AuthGuard: Access granted.');
            return true;
        }

        // not logged in so redirect to login page with the return url 
        console.log('AuthGuard: Not logged in. Redirecting to login.');
        this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
}