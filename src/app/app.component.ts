import { Component } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';

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
    currentUrl: string = '';

    constructor(
        private accountService: AccountService,
        private router: Router
    ) {
        this.accountService.account.subscribe(x => this.account = x);
        
        // Track navigation for active link highlighting
        this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd)
        ).subscribe(event => {
            this.currentUrl = event.url;
            console.log('Navigation to:', this.currentUrl);
        });
    }

    logout() {
        this.accountService.logout();
    }
    
    // Force navigation to a URL to overcome potential router issues
    navigateTo(route: string): void {
        console.log(`Forcing navigation to ${route}`);
        
        // If we're already on this route's page, don't navigate again
        if (this.isActiveRoute(route)) {
            console.log('Already on this route, not navigating');
            return;
        }
        
        // Force navigation by first going to root (skipLocationChange means URL doesn't change in browser)
        this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
            // Then navigate to the intended route
            this.router.navigateByUrl(route);
        });
    }
    
    // Improved active route detection with path-based logic
    isActiveRoute(route: string): boolean {
        // Home is active only when URL is exactly '/'
        if (route === '/' && this.currentUrl === '/') {
            return true;
        }
        
        // For non-home routes, check if the URL starts with the route path
        // but make sure we're not matching partial paths (e.g. '/profile' shouldn't match '/prof')
        if (route !== '/') {
            // Admin routes should highlight Admin link
            if (route === '/admin' && this.currentUrl.startsWith('/admin')) {
                return true;
            }
            
            // Profile routes should highlight Profile link
            if (route === '/profile' && this.currentUrl.startsWith('/profile')) {
                return true;
            }
        }
        
        return false;
    }
}
