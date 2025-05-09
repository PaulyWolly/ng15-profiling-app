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
import { SubNavComponent } from './components/subnav/subnav.component';
import { LayoutComponent } from './components/layout/layout.component';
import { OverviewComponent } from './components/overview/overview.component';
import { MonitorComponent } from './components/monitor/monitor.component';
import { SettingsComponent } from './components/settings/settings.component';
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
        AccountModule,
        OverviewComponent,
        MonitorComponent,
        SettingsComponent
    ],
    declarations: [
        SubNavComponent,
        LayoutComponent
        // Removed ListComponent, AddEditComponent 
    ]
})
export class AdminModule { }
