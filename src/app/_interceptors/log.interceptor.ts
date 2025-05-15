import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { LogsService } from '@app/_services/logs.service';
import { AccountService } from '@app/_services/account.service';
import { NavigationEnd, Router } from '@angular/router';

@Injectable()
export class LogInterceptor implements HttpInterceptor {
  private lastPageVisit: { url: string; timestamp: number } | null = null;
  private currentSessionId: string | null = null;
  private isListeningForClicks = false;

  constructor(
    private logsService: LogsService,
    private accountService: AccountService,
    private router: Router
  ) {
    // Track navigation events to log page visits
    this.setupNavigationTracking();

    // Track UI interactions (button clicks, etc.)
    this.setupInteractionTracking();
  }

  setupNavigationTracking() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUser = this.accountService.accountValue;
        if (currentUser && currentUser.email) {
          const currentUrl = event.urlAfterRedirects;
          const now = Date.now();

          // Calculate time spent on previous page
          if (this.lastPageVisit) {
            const timeSpent = now - this.lastPageVisit.timestamp;
            if (timeSpent > 1000) { // Only log if more than 1 second spent
              this.logsService.logPageNavigation(
                currentUser.email,
                this.lastPageVisit.url,
                currentUrl,
                timeSpent
              );
            }
          }

          // Update last page visit
          this.lastPageVisit = {
            url: currentUrl,
            timestamp: now
          };
        }
      }
    });

    // Log time spent when user leaves the app
    window.addEventListener('beforeunload', () => {
      this.logPageExit();
    });

    // Also log when the app is put into the background
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.logPageExit();
      }
    });
  }

  setupInteractionTracking() {
    if (this.isListeningForClicks) return;
    this.isListeningForClicks = true;

    // Listen for button clicks throughout the application
    document.addEventListener('click', (event) => {
      const currentUser = this.accountService.accountValue;
      if (!currentUser || !currentUser.email) return;

      // Find if a button or interactive element was clicked
      const target = event.target as HTMLElement;
      const button = target.closest('button, a.btn, [role="button"]');

      if (button) {
        // Extract meaningful information about the button
        let buttonText = button.textContent?.trim() || '';
        const ariaLabel = button.getAttribute('aria-label');
        const title = button.getAttribute('title');

        // If button has no visible text but has an aria-label or title, use that
        if (!buttonText && (ariaLabel || title)) {
          buttonText = ariaLabel || title || 'Unknown Button';
        }

        // Log the button click if we have meaningful text
        if (buttonText) {
          this.logsService.logUser(
            currentUser.email,
            'UI Interaction',
            `Clicked "${buttonText}" button on ${this.router.url}`,
            'Info'
          );
        }
      }
    });
  }

  logPageExit() {
    const currentUser = this.accountService.accountValue;
    if (currentUser && this.lastPageVisit) {
      const timeSpent = Date.now() - this.lastPageVisit.timestamp;
      if (timeSpent > 1000) {
        this.logsService.logPageNavigation(
          currentUser.email,
          this.lastPageVisit.url,
          'EXIT',
          timeSpent
        );
      }
    }
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip logging for certain endpoints to avoid infinite loops
    if (request.url.includes('/logs') || request.url.includes('/assets/') || request.url.endsWith('.json')) {
      return next.handle(request);
    }

    const currentUser = this.accountService.accountValue;
    const username = currentUser?.email || 'Anonymous';

    // Add session ID if tracking a session
    if (this.currentSessionId && currentUser) {
      request = request.clone({
        setHeaders: {
          'X-Session-ID': this.currentSessionId
        }
      });
    }

    // Log API calls for monitoring/cleanup operations explicitly
    if (
      request.url.includes('/refresh-tokens/cleanup') ||
      request.url.includes('/monitor') ||
      request.url.includes('/admin/') ||
      request.url.includes('/super-admin/')
    ) {
      let operation = 'API Operation';

      if (request.url.includes('/refresh-tokens/cleanup')) {
        operation = 'Token Cleanup';
      } else if (request.url.includes('/monitor')) {
        operation = 'System Monitoring';
      }

      // Log the API call
      this.logsService.logUser(
        username,
        operation,
        `${request.method} ${this.getEndpointName(request.url)}`,
        'Info'
      );
    }

    return next.handle(request).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          // Check for login response to start session tracking
          if (request.url.includes('/accounts/authenticate') && event.status === 200 && !this.currentSessionId) {
            this.currentSessionId = this.generateSessionId();
            // Reset page tracking on new login
            this.lastPageVisit = {
              url: this.router.url,
              timestamp: Date.now()
            };
          }

          // Check for logout to end session tracking
          if (request.url.includes('/accounts/revoke-token') && event.status === 200) {
            this.logPageExit();
            this.currentSessionId = null;
            this.lastPageVisit = null;
          }

          // Log specific administrative operations
          if (request.url.includes('/refresh-tokens/cleanup')) {
            this.logsService.logAudit(
              username,
              'Token Management',
              `Successfully cleaned up old tokens`,
              'Success'
            );
          }

          // Only log sensitive operations or non-GET requests
          const isSensitiveOperation = request.url.includes('/admin') ||
                                      request.url.includes('/accounts') ||
                                      request.url.includes('/auth');

          if (isSensitiveOperation || request.method !== 'GET') {
            // Log successful responses for important operations
            const status = event.status >= 400 ? 'Error' : 'Success';
            this.logsService.logUser(
              username,
              `${request.method} Request`,
              `Client: ${request.method} ${this.getRelativeUrl(request.url)} - Status: ${event.status}`,
              status
            );
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // Always log errors
        const errorMessage = error.error?.message || error.message || 'Unknown error';

        // Log specific administrative operations that failed
        if (request.url.includes('/refresh-tokens/cleanup')) {
          this.logsService.logAudit(
            username,
            'Token Management',
            `Failed to clean up tokens: ${errorMessage}`,
            'Error'
          );
        }

        this.logsService.logError(
          `${request.method} Request Error`,
          `Client: ${request.method} ${this.getRelativeUrl(request.url)} - Status: ${error.status} - ${errorMessage}`,
          username
        );
        return throwError(() => error);
      })
    );
  }

  private getRelativeUrl(url: string): string {
    try {
      // Extract path from full URL
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch (e) {
      // If not a valid URL, return as is (likely already a relative path)
      return url;
    }
  }

  private getEndpointName(url: string): string {
    try {
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split('/').filter(Boolean);
      return parts.length > 0 ? `/${parts.join('/')}` : 'Root Endpoint';
    } catch (e) {
      return url;
    }
  }

  private generateSessionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
