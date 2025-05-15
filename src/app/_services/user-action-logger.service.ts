import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { LogsService } from './logs.service';
import { AccountService } from './account.service';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserActionLoggerService {
  private lastRoute: string | null = null;
  private routeStartTime: number | null = null;

  constructor(
    private router: Router,
    private logsService: LogsService,
    private accountService: AccountService
  ) {
    this.setupNavigationTracking();
  }

  /**
   * Set up tracking of navigation events
   */
  setupNavigationTracking() {
    // Track navigation events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const currentUser = this.accountService.accountValue;
      if (!currentUser) return;

      const currentRoute = event.urlAfterRedirects || event.url;
      const now = Date.now();

      // If we have a previous route, log the navigation
      if (this.lastRoute && this.routeStartTime) {
        const timeSpent = now - this.routeStartTime;
        // Only log if time spent is significant (> 1 second)
        if (timeSpent > 1000) {
          this.logNavigation(this.lastRoute, currentRoute, timeSpent);
        }
      }

      // Update for next navigation
      this.lastRoute = currentRoute;
      this.routeStartTime = now;
    });

    // Log when user leaves or puts app in background
    window.addEventListener('beforeunload', () => {
      this.logPageExit();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.logPageExit();
      }
    });
  }

  /**
   * Log navigation between routes
   */
  logNavigation(fromRoute: string, toRoute: string, timeSpent: number) {
    const currentUser = this.accountService.accountValue;
    if (!currentUser) return;

    this.logsService.logPageNavigation(
      currentUser.email,
      fromRoute,
      toRoute,
      timeSpent
    );
  }

  /**
   * Log when user exits the app
   */
  logPageExit() {
    if (!this.lastRoute || !this.routeStartTime) return;

    const currentUser = this.accountService.accountValue;
    if (!currentUser) return;

    const timeSpent = Date.now() - this.routeStartTime;
    if (timeSpent > 1000) {
      this.logsService.logPageNavigation(
        currentUser.email,
        this.lastRoute,
        'EXIT',
        timeSpent
      );
    }
  }

  /**
   * Log a form submission
   */
  logFormSubmission(formName: string, success: boolean, details?: string) {
    const currentUser = this.accountService.accountValue;
    if (!currentUser) return;

    const status = success ? 'Success' : 'Error';
    const message = `Form: ${formName}${details ? ' - ' + details : ''}`;

    this.logsService.logUser(
      currentUser.email,
      'Form Submission',
      message,
      status
    );
  }

  /**
   * Log a data operation (create, read, update, delete)
   */
  logDataOperation(operation: 'Create' | 'Update' | 'Delete' | 'View', entityType: string, entityId?: string, details?: string) {
    const currentUser = this.accountService.accountValue;
    if (!currentUser) return;

    let message = `${operation} ${entityType}`;
    if (entityId) {
      message += ` (ID: ${entityId})`;
    }
    if (details) {
      message += ` - ${details}`;
    }

    this.logsService.logUser(
      currentUser.email,
      `${operation} ${entityType}`,
      message,
      'Info'
    );
  }

  /**
   * Log a user interaction with a specific component
   */
  logComponentInteraction(component: string, action: string, details?: string) {
    const currentUser = this.accountService.accountValue;
    if (!currentUser) return;

    let message = `${action} in ${component}`;
    if (details) {
      message += ` - ${details}`;
    }

    this.logsService.logUser(
      currentUser.email,
      'UI Interaction',
      message,
      'Info'
    );
  }

  /**
   * Log an error that occurred in the frontend
   */
  logClientError(source: string, error: any) {
    const currentUser = this.accountService.accountValue;
    const user = currentUser?.email || 'Anonymous';

    let errorMessage = error;
    if (error instanceof Error) {
      errorMessage = `${error.name}: ${error.message}`;
    } else if (typeof error === 'object') {
      errorMessage = JSON.stringify(error);
    }

    this.logsService.logError(
      `Client Error - ${source}`,
      String(errorMessage),
      user
    );
  }
}