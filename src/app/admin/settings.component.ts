import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { AccountService, SystemSettings, CleanupResult } from '@app/_services';

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

    constructor(private accountService: AccountService) {}

    ngOnInit() {
        this.loadSettings();
    }

    loadSettings() {
        this.loading = true;
        this.accountService.getSettings()
            .pipe(first())
            .subscribe({
                next: (settings) => {
                    this.settings = settings;
                    this.loading = false;
                },
                error: error => {
                    console.error('Error loading settings:', error);
                    this.loading = false;
                }
            });
    }

    runCleanup() {
        this.loading = true;
        this.accountService.cleanupSessions()
            .pipe(first())
            .subscribe({
                next: (result: CleanupResult) => {
                    this.settings.lastSessionCleanup = result.lastCleanup;
                    this.settings.nextScheduledCleanup = result.nextScheduled;
                    this.loading = false;
                },
                error: error => {
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
} 