import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountService, AlertService } from '@app/_services';
import { Subscription } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { first } from 'rxjs/operators';

interface UserSession {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isVerified: boolean;
    lastActivity: Date;
    status: 'Active' | 'Warning' | 'Revoked';
    createdByIp: string;
    expires: Date;
    isActive: boolean;
    revokedReason: string | null;
}

@Component({ 
    templateUrl: 'monitor.component.html',
    styleUrls: ['./monitor.component.scss']
})
export class MonitorComponent implements OnInit, OnDestroy {
    activeSessions: UserSession[] = [];
    loading = false;
    selectedSessions: Set<string> = new Set();
    selectAll: boolean = false;
    private subscriptions: Subscription = new Subscription();
    private refreshInterval: any;
    
    constructor(
        private accountService: AccountService,
        private http: HttpClient,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        // Initial load of sessions
        this.refresh();
        
        // Set up periodic refresh every 5 seconds
        this.refreshInterval = setInterval(() => {
            this.refresh();
        }, 5000); // More frequent updates
        
        // Ensure interval is cleared when component is destroyed
        this.subscriptions.add({
            unsubscribe: () => {
                if (this.refreshInterval) {
                    clearInterval(this.refreshInterval);
                }
            }
        });
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    /**
     * Refresh the sessions list
     */
    refresh(): void {
        if (this.loading) return; // Prevent multiple simultaneous refreshes
        
        this.loading = true;
        console.log('[MonitorComponent] Refreshing sessions...');

        this.http.get<UserSession[]>(`${environment.apiUrl}/accounts/active-sessions`)
            .pipe(first())
            .subscribe({
                next: (sessions) => {
                    console.log('[MonitorComponent] Received sessions:', sessions);
                    
                    // Only show truly active sessions
                    this.activeSessions = sessions
                        .filter(session => session.isActive)
                        .map(session => ({
                            ...session,
                            lastActivity: new Date(session.lastActivity),
                            expires: new Date(session.expires)
                        }));

                    // Clear any selected sessions that are no longer active
                    this.selectedSessions = new Set(
                        Array.from(this.selectedSessions)
                            .filter(id => this.activeSessions.some(s => s.id === id))
                    );

                    this.loading = false;
                },
                error: (err: HttpErrorResponse) => {
                    console.error('[MonitorComponent] Error fetching sessions:', err);
                    this.alertService.error('Failed to load active sessions');
                    this.loading = false;
                    this.activeSessions = [];
                }
            });
    }

    /**
     * Clean up expired tokens
     */
    cleanupTokens(): void {
        this.loading = true;
        this.alertService.clear();
        console.log('[MonitorComponent] Requesting token cleanup...');

        this.http.delete<{ message: string }>(`${environment.apiUrl}/accounts/refresh-tokens/cleanup`)
            .pipe(first())
            .subscribe({
                next: (response) => {
                    console.log('[MonitorComponent] Cleanup response:', response);
                    this.alertService.success(response.message || 'Token cleanup successful');
                    this.loading = false;
                    this.refresh();
                },
                error: (err: HttpErrorResponse) => {
                    console.error('[MonitorComponent] Error during token cleanup:', err);
                    this.alertService.error('Failed to clean up tokens');
                    this.loading = false;
                }
            });
    }

    /**
     * Check if a session belongs to the current user
     */
    isCurrentUserSession(userId: string): boolean {
        return userId === this.accountService.accountValue?.id;
    }

    /**
     * Check if a session belongs to an admin user
     */
    isAdminSession(session: UserSession): boolean {
        return session.role === 'Admin';
    }

    /**
     * Force logout a user session
     */
    forceLogout(sessionId: string): void {
        this.loading = true;
        this.alertService.clear();
        console.log('[MonitorComponent] Forcing logout for session:', sessionId);

        this.http.post<{ message: string }>(`${environment.apiUrl}/accounts/force-logout/${sessionId}`, {})
            .pipe(first())
            .subscribe({
                next: (response) => {
                    console.log('[MonitorComponent] Force logout response:', response);
                    this.alertService.success(response.message || 'User logged out successfully');
                    this.loading = false;
                    this.refresh();
                },
                error: (err: HttpErrorResponse) => {
                    console.error('[MonitorComponent] Error during force logout:', err);
                    this.alertService.error('Failed to force logout user');
                    this.loading = false;
                }
            });
    }

    /**
     * Toggle selection of all sessions
     */
    toggleSelectAll(): void {
        this.selectAll = !this.selectAll;
        this.selectedSessions.clear(); // Clear existing selections first
        
        if (this.selectAll) {
            // Add all selectable sessions except current user
            this.activeSessions
                .filter(session => !this.isCurrentUserSession(session.id))
                .forEach(session => this.selectedSessions.add(session.id));
        }
    }

    /**
     * Handle individual session selection
     */
    onSessionSelect(event: Event, sessionId: string): void {
        const checkbox = event.target as HTMLInputElement;
        if (checkbox.checked) {
            this.selectedSessions.add(sessionId);
            
            // Check if all selectable sessions are now selected
            const allSelectableSelected = this.activeSessions
                .filter(session => !this.isCurrentUserSession(session.id))
                .every(session => this.selectedSessions.has(session.id));
            
            this.selectAll = allSelectableSelected;
        } else {
            this.selectedSessions.delete(sessionId);
            this.selectAll = false;
        }
    }

    /**
     * Check if a session is selected
     */
    isSelected(sessionId: string): boolean {
        return this.selectedSessions.has(sessionId);
    }

    /**
     * Delete selected sessions
     */
    deleteSelected(): void {
        if (this.selectedSessions.size === 0) return;

        this.loading = true;
        this.alertService.clear();
        const sessionIds = Array.from(this.selectedSessions);
        console.log('[MonitorComponent] Attempting to delete sessions:', sessionIds);

        this.http.post<{ message: string }>(`${environment.apiUrl}/accounts/force-logout-bulk`, {
            sessionIds: sessionIds
        })
        .pipe(first())
        .subscribe({
            next: (response) => {
                console.log('[MonitorComponent] Bulk delete response:', response);
                this.alertService.success(response.message || 'Selected sessions deleted successfully');
                this.selectedSessions.clear();
                this.selectAll = false;
                this.loading = false;
                this.refresh();
            },
            error: (err: HttpErrorResponse) => {
                console.error('[MonitorComponent] Error during bulk delete:', err);
                this.alertService.error(`Failed to delete selected sessions: ${err.error?.message || err.message}`);
                this.loading = false;
            }
        });
    }

    /**
     * Clean up all sessions except current
     */
    cleanupAllSessions(): void {
        this.loading = true;
        this.alertService.clear();
        console.log('[MonitorComponent] Cleaning up all sessions...');

        this.http.post<{ message: string }>(`${environment.apiUrl}/accounts/cleanup-all-sessions`, {})
            .pipe(first())
            .subscribe({
                next: (response) => {
                    console.log('[MonitorComponent] Cleanup response:', response);
                    this.alertService.success(response.message || 'All sessions cleaned up successfully');
                    this.selectedSessions.clear();
                    this.selectAll = false;
                    this.loading = false;
                    this.refresh();
                },
                error: (err: HttpErrorResponse) => {
                    console.error('[MonitorComponent] Error during session cleanup:', err);
                    this.alertService.error(`Failed to clean up sessions: ${err.error?.message || err.message}`);
                    this.loading = false;
                }
            });
    }
} 