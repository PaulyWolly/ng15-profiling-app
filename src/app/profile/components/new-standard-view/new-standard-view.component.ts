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
import { Subscription } from 'rxjs';

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
        MatDividerModule
    ]
})
export class NewStandardViewComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;

    @Input() isPreview: boolean = false;
    @Input() isOwnProfile: boolean = true;
    @Input() profile?: Account;
    
    loading: boolean = true;
    private accountSubscription?: Subscription;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private dialog: MatDialog,
        private cdRef: ChangeDetectorRef
    ) {
        this.route.queryParams.subscribe(params => {
            // Only override isPreview if explicitly set in query params
            if (params['preview'] === 'true') {
                this.isPreview = true;
            }
        });
    }

    ngOnInit() {
        console.log('NewStandardViewComponent ngOnInit');
        
        // Only load account data if profile is not provided via Input
        if (!this.profile) {
            this.loading = true;
            this.accountSubscription = this.accountService.account.subscribe({
                next: (account) => {
                    console.log('Account data received:', account);
                    this.profile = account ? account : undefined;
                    this.loading = false;
                    this.cdRef.detectChanges();
                },
                error: (error) => {
                    console.error('Error getting account:', error);
                    this.profile = undefined;
                    this.loading = false;
                    this.cdRef.detectChanges();
                }
            });
        } else {
            this.loading = false;
        }
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

    editProfile(): void {
        this.router.navigate(['/profile/edit']);
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