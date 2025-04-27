import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileTemplateService } from '@app/_services';
import { AssetService } from '@app/_services/asset.service';
import { ProfileTemplate, ProfileTemplateType } from '@app/_models/profile-template';

@Component({
    selector: 'app-profile-templates',
    templateUrl: './profile-templates.component.html',
    styleUrls: ['./profile-templates.component.scss']
})
export class ProfileTemplatesComponent implements OnInit {
    templates: ProfileTemplate[] = [];
    currentTemplate: ProfileTemplateType;

    constructor(
        private profileTemplateService: ProfileTemplateService,
        private assetService: AssetService,
        private router: Router
    ) {
        this.currentTemplate = this.profileTemplateService.currentTemplateValue;
    }

    ngOnInit() {
        this.templates = this.profileTemplateService.getTemplates().map(template => ({
            ...template,
            thumbnailUrl: this.assetService.getAssetUrl(template.thumbnailUrl),
            previewUrl: this.assetService.getAssetUrl(template.previewUrl)
        }));
    }

    selectTemplate(templateId: ProfileTemplateType) {
        this.currentTemplate = templateId;
        
        // Set the template in the service
        this.profileTemplateService.setTemplate(templateId);

        // Route to the appropriate view based on template type
        switch (templateId) {
            case ProfileTemplateType.SOCIAL_MEDIA:
                this.router.navigate(['/profile-templates/social-media']);
                break;
            case ProfileTemplateType.STANDARD:
                this.router.navigate(['/profile-templates/standard']);
                break;
            default:
                this.router.navigate(['/profile']);
                break;
        }
    }

    getTemplateRoute(templateId: ProfileTemplateType): string {
        switch (templateId) {
            case ProfileTemplateType.SOCIAL_MEDIA:
                return '/profile-templates/social-media';
            case ProfileTemplateType.STANDARD:
                return '/profile-templates/standard';
            default:
                return '/profile';
        }
    }
} 