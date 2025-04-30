import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, Router } from '@angular/router';
import { Account } from '@app/_models';
import { AccountService } from '@app/_services';
import { MatDialog } from '@angular/material/dialog';
import { MapDialogComponent } from '../../components/map-dialog/map-dialog.component';
import { Subscription, delay, retryWhen, take } from 'rxjs';
import { CurvedBorderComponent } from '@app/shared/curved-border/curved-border.component';

@Component({
    selector: 'app-new-standard-view',
    templateUrl: './new-standard-view.component.html',
    styleUrls: ['./new-standard-view.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatDividerModule,
        CurvedBorderComponent
    ]
})
export class NewStandardViewComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;

    @Input() isPreview: boolean = false;
    @Input() isOwnProfile: boolean = true;
    @Input() profile?: Account;
    
    loading: boolean = true;
    private accountSubscription?: Subscription;
    private maxRetries = 3;
    private retryCount = 0;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private dialog: MatDialog,
        private cdRef: ChangeDetectorRef
    ) {
        this.route.queryParams.subscribe(params => {
            if (params['preview'] === 'true') {
                this.isPreview = true;
            }
        });
    }

    ngOnInit() {
        console.log('NewStandardViewComponent ngOnInit');
        this.loadProfileData();
    }

    private loadProfileData() {
        if (!this.profile) {
            this.loading = true;
            this.accountSubscription = this.accountService.account
                .pipe(
                    retryWhen(errors => 
                        errors.pipe(
                            delay(1000), // Wait 1 second between retries
                            take(this.maxRetries) // Maximum number of retries
                        )
                    )
                )
                .subscribe({
                    next: (account) => {
                        console.log('Account data received:', account);
                        if (account) {
                            this.profile = account;
                            this.loading = false;
                            this.retryCount = 0; // Reset retry count on success
                        } else if (this.retryCount < this.maxRetries) {
                            // If no account and haven't exceeded retries, try to get account by ID
                            this.retryCount++;
                            const currentUser = this.accountService.accountValue;
                            if (currentUser?.id) {
                                this.accountService.getById(currentUser.id).subscribe({
                                    next: (fullAccount) => {
                                        this.profile = fullAccount;
                                        this.loading = false;
                                    },
                                    error: (error) => {
                                        console.error('Error getting account by ID:', error);
                                        this.loading = false;
                                    }
                                });
                            } else {
                                this.loading = false;
                            }
                        } else {
                            this.loading = false;
                        }
                        this.cdRef.detectChanges();
                    },
                    error: (error) => {
                        console.error('Error getting account:', error);
                        this.loading = false;
                        this.cdRef.detectChanges();
                    }
                });
        } else {
            this.loading = false;
        }
    }

    retryLoading(): void {
        this.retryCount = 0; // Reset retry count
        this.loadProfileData();
    }

    ngAfterViewInit(): void {
        console.log('NewStandardViewComponent ngAfterViewInit');
        if (this.scrollContainer?.nativeElement) {
            const container = this.scrollContainer.nativeElement;
            setTimeout(() => {
                console.log('Scrolling container to top:', container);
                container.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            }, 0);
        } else {
            console.warn('Scroll container ElementRef not found.');
        }
    }

    ngOnDestroy() {
        console.log('NewStandardViewComponent ngOnDestroy');
        if (this.accountSubscription) {
            this.accountSubscription.unsubscribe();
        }
    }

    get hasAddress(): boolean {
        return !!(this.profile?.address && this.profile?.city && this.profile?.state);
    }

    get hasSocialLinks(): boolean {
        return !!(
            this.profile?.linkedin || 
            this.profile?.twitter || 
            this.profile?.github || 
            this.profile?.instagram || 
            this.profile?.facebook
        );
    }

    openMapDialog(): void {
        if (!this.profile) return;

        this.dialog.open(MapDialogComponent, {
            data: {
                address: this.profile.address || '',
                city: this.profile.city || '',
                state: this.profile.state || '',
                zipCode: this.profile.zipCode || ''
            }
        });
    }
} 