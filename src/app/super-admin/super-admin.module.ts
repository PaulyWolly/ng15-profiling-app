import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { SuperAdminRoutingModule } from './super-admin-routing.module';
import { SubNavComponent } from './components/subnav/subnav.component';
import { SuperAdminLayoutComponent } from './components/super-admin-layout/super-admin-layout.component';
import { OverviewComponent } from './components/overview/overview.component';
import { MonitorComponent } from './components/monitor/monitor.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LogsComponent } from './components/logs/logs.component';
import { ScriptsComponent } from './components/scripts/scripts.component';
import { SuperAdminComponent } from './super-admin/super-admin.component';
import { SuperAdminOverviewComponent } from '@app/super-admin-old/components/super-admin-overview.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule,
        SuperAdminRoutingModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        OverviewComponent,
        MonitorComponent,
        SettingsComponent,
        LogsComponent,
        SubNavComponent,
        ScriptsComponent,
        SuperAdminOverviewComponent
    ],
    declarations: [
        SuperAdminLayoutComponent,
        SuperAdminComponent
    ]
})
export class SuperAdminModule { }
