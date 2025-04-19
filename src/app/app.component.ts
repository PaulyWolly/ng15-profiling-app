import { Component, OnInit, HostListener, Renderer2, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';

import { AccountService } from './_services';
import { Account, Role } from './_models';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['./app.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
    Role = Role;
    account?: Account | null;
    currentUrl: string = '';

    constructor(
        private accountService: AccountService,
        private router: Router,
        private renderer: Renderer2
    ) {
        this.accountService.account.subscribe(x => this.account = x);
        
        // Track navigation for active link highlighting
        this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd)
        ).subscribe(event => {
            this.currentUrl = event.url;
            console.log('Navigation to:', this.currentUrl);
            
            // Check for account pages and apply no-scroll class
            this.handleAccountPagesScrolling(this.currentUrl);
        });
    }

    // Handle specific pages that need special scroll handling
    private handleAccountPagesScrolling(url: string) {
        const isAccountPage = url.includes('/account/') || 
                             url.includes('/login') || 
                             url.includes('/register') || 
                             url.includes('/forgot-password') ||
                             url.includes('/reset-password');
                             
        if (isAccountPage) {
            // Add classes to disable scrolling on account pages
            this.renderer.addClass(document.documentElement, 'no-scroll');
            this.renderer.addClass(document.body, 'no-scroll');
            this.renderer.addClass(document.body, 'account-page');
        } else {
            // Remove classes when not on account pages
            this.renderer.removeClass(document.documentElement, 'no-scroll');
            this.renderer.removeClass(document.body, 'no-scroll');
            this.renderer.removeClass(document.body, 'account-page');
        }
    }

    // Global wheel event listener to prevent body scrolling except in specific places
    @HostListener('wheel', ['$event'])
    onWheel(event: WheelEvent) {
        // Get the event target
        const target = event.target as HTMLElement;
        
        // Check if we're inside one of the allowed scrollable areas
        let inAllowedScrollableArea = false;
        let currentEl = target;
        
        // Traverse up the DOM tree to check for allowed scrollable containers
        while (currentEl && !inAllowedScrollableArea) {
            // Check for profile edit page right column
            if (currentEl.classList && (
                // Check for profile edit right column
                (currentEl.classList.contains('scrollable-form-container') && 
                 this.isInsideComponent(currentEl, 'app-edit')) ||
                // Check for admin edit right column
                (currentEl.classList.contains('scrollable-form-container') && 
                 this.isInsideComponent(currentEl, 'app-add-edit'))
            )) {
                inAllowedScrollableArea = true;
                break;
            }
            
            // Also check for the parent column elements
            if (currentEl.classList && 
                currentEl.classList.contains('col-md-8') && 
                (this.isInsideComponent(currentEl, 'app-edit') || 
                 this.isInsideComponent(currentEl, 'app-add-edit'))) {
                inAllowedScrollableArea = true;
                break;
            }
            
            // Move up to parent
            if (currentEl.parentElement) {
                currentEl = currentEl.parentElement;
            } else {
                break;
            }
        }
        
        // If we're not in an allowed scrollable area, prevent scrolling
        if (!inAllowedScrollableArea) {
            // Only prevent default if the event is directly on the body or app-root
            if (!target || 
                target.tagName === 'BODY' || 
                target.tagName === 'APP-ROOT' ||
                target.tagName === 'HTML') {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }

    // Helper method to check if an element is inside a specific component
    private isInsideComponent(element: HTMLElement, componentTag: string): boolean {
        let current = element;
        while (current) {
            if (current.tagName && current.tagName.toLowerCase() === componentTag.toLowerCase()) {
                return true;
            }
            if (!current.parentElement) {
                break;
            }
            current = current.parentElement;
        }
        return false;
    }

    ngOnInit() {
        // Initialize the account service to restore the session
        this.accountService.initialize();

        // Listen to route changes to apply body classes for account pages
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            const url = event.url;
            // Check if we're on a login or account page
            if (url.includes('/account/login') || 
                url.includes('/account/register') || 
                url.includes('/account/forgot-password') || 
                url.includes('/account/reset-password')) {
                document.body.classList.add('login-page');
                document.documentElement.classList.add('login-page');
                
                // Also add CSS class to prevent scrolling
                document.body.classList.add('no-scroll');
                document.documentElement.classList.add('no-scroll');
            } else {
                document.body.classList.remove('login-page');
                document.documentElement.classList.remove('login-page');
                
                // Remove the no-scroll class on non-account pages
                document.body.classList.remove('no-scroll');
                document.documentElement.classList.remove('no-scroll');
            }
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
