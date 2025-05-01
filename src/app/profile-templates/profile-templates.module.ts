import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProfileTemplatesComponent } from './profile-templates.component';
import { ProfileTemplatesRoutingModule } from './profile-templates-routing.module';
import { NewStandardPreviewComponent } from './components/previews/new-standard-preview/new-standard-preview.component';
import { NewSocialMediaPreviewComponent } from './components/previews/new-social-media-preview/new-social-media-preview.component';
import { NewBusinessPreviewComponent } from './components/previews/new-business-preview/new-business-preview.component';
import { AssetService } from '@app/_services/asset.service';
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
    declarations: [
        ProfileTemplatesComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        ProfileTemplatesRoutingModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatProgressSpinnerModule,
        SharedModule,
        // Standalone Components
        NewStandardPreviewComponent,
        NewSocialMediaPreviewComponent,
        NewBusinessPreviewComponent
    ],
    exports: [
        ProfileTemplatesComponent,
        NewStandardPreviewComponent,
        NewSocialMediaPreviewComponent,
        NewBusinessPreviewComponent
    ],
    providers: [
        AssetService
    ]
})
export class ProfileTemplatesModule { } 