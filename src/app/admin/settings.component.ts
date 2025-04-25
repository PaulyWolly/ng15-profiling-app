import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { AccountService, SystemSettings, CleanupResult, AlertService } from '@app/_services';
import { CleanupHistoryRecord } from '@app/_services/account.service';

@Component({
    templateUrl: 'settings.component.html'
})
export class SettingsComponent implements OnInit {
    settings: SystemSettings = {
        activeSessionCount: 0,
        lastSessionCleanup: null,
        nextScheduledCleanup: null,
        cleanupSchedule: '0 0 * * *'
    };
    loading = false;
    historyLoading = false;
    cleanupHistory: CleanupHistoryRecord[] = [];
    currentPage = 0;
    pageSize = 5;
    totalRecords = 0;
    hasMoreRecords = false;
    loadError: string | null = null;

    constructor(
        private accountService: AccountService,
        private alertService: AlertService
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
        this.accountService.getCleanupHistory(this.pageSize, this.currentPage * this.pageSize)
            .subscribe({
                next: (response) => {
                    this.cleanupHistory = response.history;
                    this.totalRecords = response.pagination.total;
                    this.hasMoreRecords = response.pagination.hasMore;
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
                        this.loadCleanupHistory(); // Reload the list
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
        if (this.currentPage > 0) {
            this.currentPage--;
            this.loadCleanupHistory();
        }
    }

    nextPage() {
        if (this.hasMoreRecords) {
            this.currentPage++;
            this.loadCleanupHistory();
        }
    }
} 