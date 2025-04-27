import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Account } from '@app/_models';
import { environment } from '@environments/environment';
import { ProfileTemplateService } from '@app/_services/profile-template.service';
import { Router } from '@angular/router';
import { ProfileTemplateType } from '@app/_models/profile-template';
import { AccountService } from '@app/_services/account.service';

@Component({
    selector: 'app-new-social-media-view',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressSpinnerModule
    ],
    template: `
        <div class="new-social-media-container" style="max-width: 1400px; width: 70%; margin: 0 auto;">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 style="margin: 0;">Social-Media Template</h2>
                <div>
                    <button mat-raised-button color="primary" (click)="useTemplate()" class="me-2">
                        <mat-icon>check_circle</mat-icon>
                        Use This Template
                    </button>
                    <button mat-button color="accent">
                        <mat-icon>preview</mat-icon>
                        Live Preview
                    </button>
                </div>
            </div>
            <div style="background: #fff; border-radius: 18px; box-shadow: 0 2px 16px rgba(0,0,0,0.08); padding: 32px; width: 100%; display: flex; align-items: flex-start; gap: 32px;">
                <img src="assets/images/profile-templates/social-media-template.png" alt="Social Media Template Preview" style="max-width: 800px; width: 100%; height: auto; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                <div class="preview-description" style="flex: 1; min-width: 220px;">
                    <p>
                        This is our new social media template, featuring a modern, social-inspired layout for your professional profile.
                    </p>
                    <div class="features-list">
                        <h3>Features:</h3>
                        <ul>
                            <li>Large profile image and header</li>
                            <li>Followers and following counts</li>
                            <li>Social links and contact info</li>
                            <li>Followers you know preview</li>
                            <li>Modern, card-based design</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [``]
})
export class NewSocialMediaViewComponent {
    accountImage: string | null = null;
    accountName: string = 'Your Name';
    accountPosition: string = 'Your Position';
    showFallbackImage = false;

    constructor(
        private profileTemplateService: ProfileTemplateService,
        private router: Router,
        private accountService: AccountService
    ) {
        const account = this.accountService.accountValue;
        if (account) {
            this.accountImage = account.profileImage || '';
            this.accountName = `${account.firstName} ${account.lastName}`;
            this.accountPosition = account.position || 'Owner/Developer/Designer';
        }
    }

    useTemplate() {
        this.profileTemplateService.setTemplate(ProfileTemplateType.SOCIAL_MEDIA);
        this.router.navigate(['/profile'], { queryParams: { template: 'social-media' } });
    }
} 