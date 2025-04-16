import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ProfileRoutingModule } from './profile-routing.module';
import { LayoutComponent } from './layout.component';
import { DetailsComponent } from './details.component';
import { EditComponent } from './edit.component';
import { ProfileComponent } from './profile.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        ProfileRoutingModule,
        MatIconModule,
        MatButtonModule
    ],
    declarations: [
        LayoutComponent,
        DetailsComponent,
        EditComponent,
        ProfileComponent
    ]
})
export class ProfileModule { }