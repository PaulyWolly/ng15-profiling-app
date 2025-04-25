import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { AlertService } from '@app/_services';
import { TitleComponent } from '@app/shared/components/title/title.component';
import { first } from 'rxjs/operators';
import { AccountService, SystemSettings, CleanupResult, CleanupHistoryRecord } from '@app/_services';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [
        CommonModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        TitleComponent
    ],
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
    settings: SystemSettings = {
        activeSessionCount: 0,
        lastSessionCleanup: null,
        nextScheduledCleanup: null,
        cleanupSchedule: '0 0 * * *'
    };
    loading = false;
    historyLoading = false;
    cleanupHistory: CleanupHistoryRecord[] = [];
    currentPage = 1;
    pageSize = 2;
    totalRecords = 0;
    totalPages = 0;
    loadError: string | null = null;

    constructor(
        private accountService: AccountService,
        private alertService: AlertService,
        private http: HttpClient
    ) {}

    ngOnInit() {
        this.loadSettings();
        this.loadCleanupHistory();
    }

    loadSettings() {
        this.loading = true;
        this.loadError = null;
        this.accountService.getSettings()
            .pipe(first())
            .subscribe({
                next: (settings) => {
                    this.settings = settings;
                    this.loading = false;
                    if (settings.activeSessionCount === undefined || settings.activeSessionCount === null) {
                        this.loadError = 'Failed to load active sessions count';
                        this.alertService.error(this.loadError);
                    }
                },
                error: error => {
                    this.loadError = 'Failed to load settings: ' + (error.message || 'Unknown error');
                    this.alertService.error(this.loadError);
                    console.error('Error loading settings:', error);
                    this.loading = false;
                    // Set default values on error
                    this.settings = {
                        activeSessionCount: 0,
                        lastSessionCleanup: null,
                        nextScheduledCleanup: null,
                        cleanupSchedule: '0 0 * * *'
                    };
                }
            });
    }

    runCleanup() {
        this.loading = true;
        this.loadError = null;
        this.accountService.cleanupSessions()
            .pipe(first())
            .subscribe({
                next: (result: CleanupResult) => {
                    this.settings.lastSessionCleanup = result.lastCleanup;
                    this.settings.nextScheduledCleanup = result.nextScheduled;
                    this.loading = false;
                    this.loadSettings(); // Reload settings to get updated active sessions count
                    this.loadCleanupHistory(); // Reload the cleanup history
                    this.alertService.success('Cleanup completed successfully');
                },
                error: error => {
                    this.loadError = 'Error running cleanup: ' + (error.message || 'Unknown error');
                    this.alertService.error(this.loadError);
                    console.error('Error running cleanup:', error);
                    this.loading = false;
                }
            });
    }

    updateSchedule() {
        this.loading = true;
        this.accountService.updateCleanupSchedule(this.settings.cleanupSchedule)
            .pipe(first())
            .subscribe({
                next: (result: CleanupResult) => {
                    this.settings.nextScheduledCleanup = result.nextScheduled;
                    this.loading = false;
                },
                error: error => {
                    console.error('Error updating schedule:', error);
                    this.loading = false;
                }
            });
    }

    loadCleanupHistory() {
        this.historyLoading = true;
        const params = {
            limit: this.pageSize.toString(),
            skip: ((this.currentPage - 1) * this.pageSize).toString()
        };
        
        this.http.get<any>(`${environment.apiUrl}/admin/cleanup-history`, { params })
            .subscribe({
                next: (response) => {
                    this.cleanupHistory = response.history || [];
                    if (response.pagination) {
                        this.totalRecords = response.pagination.total;
                        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
                        if (this.currentPage > this.totalPages && this.totalPages > 0) {
                            this.currentPage = this.totalPages;
                        }
                        if (this.totalRecords > 0 && this.currentPage < 1) {
                            this.currentPage = 1;
                        }
                    } else {
                        this.totalRecords = this.cleanupHistory.length;
                        this.totalPages = 1;
                        this.currentPage = 1;
                    }
                    this.historyLoading = false;
                },
                error: (error) => {
                    console.error('Error loading cleanup history:', error);
                    this.alertService.error('Failed to load cleanup history');
                    this.historyLoading = false;
                }
            });
    }

    deleteRecord(id: string) {
        if (confirm('Are you sure you want to delete this record?')) {
            this.historyLoading = true;
            this.accountService.deleteCleanupRecord(id)
                .subscribe({
                    next: () => {
                        this.alertService.success('Record deleted successfully');
                        this.loadCleanupHistory();
                    },
                    error: (error) => {
                        console.error('Error deleting record:', error);
                        this.alertService.error('Failed to delete record');
                        this.historyLoading = false;
                    }
                });
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadCleanupHistory();
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadCleanupHistory();
        }
    }

    ngOnDestroy() {
        // Cleanup code if needed
    }
} 