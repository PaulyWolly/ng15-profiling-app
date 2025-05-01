import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SharedModule } from '../shared/shared.module';
import { ProfileTemplatesModule } from '@app/profile-templates/profile-templates.module';

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
import { MatTooltipModule } from '@angular/material/tooltip';

// Routing
import { ProfileRoutingModule } from './profile-routing.module';

// Container Components
import { ProfileComponent } from './containers/profile/profile.component';
import { LayoutComponent } from './containers/layout/layout.component';
import { DetailsComponent } from './containers/details/details.component';
import { EditComponent } from './containers/edit/edit.component';
import { EditProfileComponent } from './containers/edit-profile/edit-profile.component';
import { AccountSettingsComponent } from './containers/account-settings/account-settings.component';

// Presentational Components
import { MapDialogComponent } from './components/map-dialog/map-dialog.component';

// Custom Directive
@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        ProfileRoutingModule,
        SharedModule,
        ProfileTemplatesModule,
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
        MatTooltipModule
    ],
    declarations: [
        ProfileComponent,
        LayoutComponent,
        DetailsComponent,
        EditComponent,
        EditProfileComponent,
        AccountSettingsComponent,
        MapDialogComponent
    ],
    exports: [
        ProfileComponent
    ]
})
export class ProfileModule { }