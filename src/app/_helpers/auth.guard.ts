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
        console.log('[AuthGuard] Checking activation for', state.url);
        // Check for stored JWT token (correct key). Use sessionStorage noramlly if available, otherwise use localStorage with 'Remember Me' clicked.
        const jwtToken = sessionStorage.getItem('jwt_token') || localStorage.getItem('jwt_token');
        if (jwtToken) {
            console.log('[AuthGuard] JWT token found, checking authorization');
            // Check if route is restricted by role
            if (route.data.roles && route.data.roles.length) {
                // Get role from account or JWT token
                let accountRole = account?.role;
                if (!accountRole && jwtToken) {
                    try {
                        const decodedToken = JSON.parse(atob(jwtToken.split('.')[1]));
                        accountRole = decodedToken.role;
                        console.log('[AuthGuard] Extracted role from JWT:', accountRole);
                    } catch (e) {
                        console.error('[AuthGuard] Error parsing JWT token:', e);
                    }
                }
                // Check if user has required role
                if (!accountRole || !route.data.roles.includes(accountRole)) {
                    console.log(`[AuthGuard] Role '${accountRole}' not authorized for route. Required roles:`, route.data.roles);
                    // Redirect to home page if not in required role
                    this.router.navigate(['/']);
                    return false;
                }
                console.log(`[AuthGuard] Role '${accountRole}' is authorized for route`);
            }
            return true;
        }
        // Not logged in - redirect to login page with return url
        console.log('[AuthGuard] No JWT token found, redirecting to login');
        this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
}