import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '@app/_services/account.service';
import { ProfileTemplateService } from '@app/_services/profile-template.service';
import { ProfileTemplateType } from '@app/_models/profile-template';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TitleComponent } from '@app/shared/components/title/title.component';

@Component({
    selector: 'app-new-social-media-view',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        TitleComponent
    ],
    templateUrl: './new-social-media-view.component.html',
    styleUrls: ['./new-social-media-view.component.scss']
})
export class NewSocialMediaViewComponent {
    constructor(
        private router: Router,
        private accountService: AccountService,
        private profileTemplateService: ProfileTemplateService
    ) {}

    async useTemplate() {
        try {
            const currentUser = this.accountService.accountValue;
            if (currentUser?.id) {
                await this.accountService.update(currentUser.id, { 
                    profileTemplateType: ProfileTemplateType.SOCIAL_MEDIA 
                }).toPromise();
                this.profileTemplateService.setTemplate(ProfileTemplateType.SOCIAL_MEDIA, true);
            } else {
                this.profileTemplateService.setTemplate(ProfileTemplateType.SOCIAL_MEDIA);
            }
            await this.router.navigate(['/profile']);
        } catch (error) {
            console.error('Error updating template:', error);
        }
    }

    previewTemplate() {
        this.router.navigate(['/profile-templates/preview/social-media']);
    }
} 