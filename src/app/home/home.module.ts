import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { HomeComponent } from './home.component';
import { ProfileImageDisplayComponent } from './profile-image-display.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MatIconModule,
        MatProgressSpinnerModule
    ],
    declarations: [
        HomeComponent,
        ProfileImageDisplayComponent
    ]
})
export class HomeModule { } 