import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Directive, HostListener, ElementRef } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';

// Routing
import { ProfileRoutingModule } from './profile-routing.module';

// Container Components
import { ProfileComponent } from './containers/profile/profile.component';
import { LayoutComponent } from './containers/layout/layout.component';
import { DetailsComponent } from './containers/details/details.component';
import { EditComponent } from './containers/edit/edit.component';
import { EditProfileComponent } from './containers/edit-profile/edit-profile.component';
import { AccountSettingsComponent } from './containers/account-settings/account-settings.component';
import { NewStandardViewComponent } from './components/new-standard-view/new-standard-view.component';

// Presentational Components
import { StandardProfileComponent } from './components/standard-profile/standard-profile.component';
import { BusinessCardComponent } from './components/business-card/business-card.component';
import { MapDialogComponent } from './components/map-dialog/map-dialog.component';
import { NewSocialMediaComponent } from '../profile-templates/components/new-social-media/new-social-media.component';
import { NewSocialMediaViewComponent } from '../profile-templates/views/new-social-media-view/new-social-media-view.component';
import { NewStandardComponent } from '../profile-templates/components/new-standard/new-standard.component';

// Custom Directive to prevent wheel event propagation
@Directive({
    selector: '[preventWheelPropagation]'
})
export class PreventWheelPropagationDirective {
    constructor(private el: ElementRef) {}

    @HostListener('wheel', ['$event'])
    onWheel(event: Event) {
        event.stopPropagation();
    }
}

// @ts-ignore: This suppresses the static reference linting error
@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        ProfileRoutingModule,
        SharedModule,
        // Angular CDK
        DragDropModule,
        // Material modules
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatTabsModule,
        MatProgressSpinnerModule,
        MatBadgeModule,
        MatInputModule,
        MatFormFieldModule,
        MatDialogModule,
        MatExpansionModule,
        // Standalone Components
        NewStandardViewComponent,
        NewSocialMediaComponent
    ],
    declarations: [
        // Container Components
        ProfileComponent,
        LayoutComponent,
        DetailsComponent,
        EditComponent,
        EditProfileComponent,
        AccountSettingsComponent,
        
        // Presentational Components
        StandardProfileComponent,
        BusinessCardComponent,
        MapDialogComponent,
        // Directives
        PreventWheelPropagationDirective
    ],
    exports: [
        PreventWheelPropagationDirective
    ]
})
export class ProfileModule {
    constructor() {
        console.log('Profile module loaded!');
    }
}