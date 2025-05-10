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
        console.log('[AuthGuard] Checking route:', state.url);
        const account = this.accountService.accountValue;
        console.log('[AuthGuard] Account value:', account);
        
        if (account) {
            console.log('[AuthGuard] User is authenticated, allowing access');
            return true;
        }

        console.log('[AuthGuard] User is not authenticated, redirecting to login');
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url }});
        return false;
    }
} 