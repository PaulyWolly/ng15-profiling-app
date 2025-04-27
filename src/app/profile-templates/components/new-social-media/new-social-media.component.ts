import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfileTemplateService, AccountService } from '@app/_services';
import { ProfileTemplateType } from '@app/_models/profile-template';
import { Account } from '@app/_models';
import { first } from 'rxjs/operators';
import { TitleComponent } from '@app/shared/components/title/title.component';

@Component({
    selector: 'app-new-social-media',
    templateUrl: './new-social-media.component.html',
    styleUrls: ['./new-social-media.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressSpinnerModule,
        TitleComponent
    ]
})
export class NewSocialMediaComponent implements OnInit {
    @Input() profile?: Account;
    @Input() isOwnProfile: boolean = false;
    loading = true;
    error = '';
    isPreview = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private profileTemplateService: ProfileTemplateService,
        private accountService: AccountService
    ) {
        this.route.queryParams.subscribe(params => {
            this.isPreview = params['preview'] === 'true';
        });
    }

    ngOnInit() {
        this.loadProfile();
    }

    private loadProfile() {
        this.loading = true;
        this.accountService.account.subscribe({
            next: (account) => {
                if (account) {
                    this.profile = account;
                    this.error = '';
                } else {
                    this.error = 'Profile not found';
                }
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading profile:', err);
                this.error = 'Error loading profile';
                this.loading = false;
            }
        });
    }

    useTemplate(): void {
        this.loading = true;
        const currentUser = this.accountService.accountValue;
        if (currentUser?.id) {
            this.accountService.update(currentUser.id, { 
                profileTemplateType: ProfileTemplateType.SOCIAL_MEDIA 
            })
            .pipe(first())
            .subscribe({
                next: () => {
                    this.profileTemplateService.setTemplate(ProfileTemplateType.SOCIAL_MEDIA, true);
                    this.router.navigate(['/profile'], { 
                        queryParams: { template: 'social-media' }
                    }).then(() => window.location.reload());
                },
                error: (error) => {
                    console.error('Error updating template:', error);
                    this.error = 'Failed to update template';
                    this.loading = false;
                }
            });
        } else {
            this.profileTemplateService.setTemplate(ProfileTemplateType.SOCIAL_MEDIA);
            this.router.navigate(['/profile'], { 
                queryParams: { template: 'social-media' }
            }).then(() => window.location.reload());
        }
    }

    previewTemplate(): void {
        this.profileTemplateService.setTemplate(ProfileTemplateType.SOCIAL_MEDIA);
        this.router.navigate(['/profile'], { 
            queryParams: { template: 'social-media', preview: 'true' }
        });
    }
} 