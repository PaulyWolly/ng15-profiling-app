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

import { AdminRoutingModule } from './admin-routing.module';
import { SubNavComponent } from './components/subnav/subnav.component';
import { LayoutComponent } from './components/layout/layout.component';
import { OverviewComponent } from './components/overview/overview.component';
import { MonitorComponent } from './components/monitor/monitor.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ScriptsComponent } from './scripts/scripts.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule,
        AdminRoutingModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatProgressSpinnerModule,
        OverviewComponent,
        MonitorComponent,
        SettingsComponent
    ],
    declarations: [
        SubNavComponent,
        LayoutComponent,
        ScriptsComponent
    ]
})
export class AdminModule { }
