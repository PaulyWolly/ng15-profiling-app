import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileTemplatesComponent } from './profile-templates.component';
import { ProfileTemplatesRoutingModule } from './profile-templates-routing.module';
import { AssetService } from '@app/_services/asset.service';

@NgModule({
    declarations: [
        ProfileTemplatesComponent
    ],
    imports: [
        CommonModule,
        ProfileTemplatesRoutingModule
    ],
    providers: [
        AssetService
    ]
})
export class ProfileTemplatesModule { } 