import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Material Modules needed for Admin section
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AdminRoutingModule } from './admin-routing.module';
import { SubNavComponent } from './subnav.component';
import { LayoutComponent } from './layout.component';
import { OverviewComponent } from './overview.component';
import { MonitorComponent } from './monitor.component';
import { SettingsComponent } from './settings.component';
import { AccountModule } from '../account/account.module';
// Removed ListComponent and AddEditComponent declarations here
// They should be declared in AccountsModule if it exists, or here if not

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule, // Add FormsModule for ngModel support
        AdminRoutingModule,
        // Add Material Modules
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatProgressSpinnerModule,
        AccountModule
    ],
    declarations: [
        SubNavComponent,
        LayoutComponent
        // Removed OverviewComponent,
        // Removed MonitorComponent,
        // Removed SettingsComponent
        // Removed ListComponent, AddEditComponent 
    ]
})
export class AdminModule { }
