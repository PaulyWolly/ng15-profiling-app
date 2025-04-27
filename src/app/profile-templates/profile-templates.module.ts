import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProfileTemplatesComponent } from './profile-templates.component';
import { ProfileTemplatesRoutingModule } from './profile-templates-routing.module';
import { NewStandardComponent } from './components/new-standard/new-standard.component';
import { NewSocialMediaViewComponent } from './views/new-social-media-view/new-social-media-view.component';
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
        NewStandardComponent,
        NewSocialMediaViewComponent
    ],
    exports: [
        ProfileTemplatesComponent,
        NewStandardComponent,
        NewSocialMediaViewComponent
    ],
    providers: [
        AssetService
    ]
})
export class ProfileTemplatesModule { } 