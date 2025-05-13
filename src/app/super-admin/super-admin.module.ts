import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SuperAdminComponent } from './super-admin/super-admin.component';
import { SuperAdminSubnavComponent } from './components/super-admin-subnav/super-admin-subnav.component';
import { SuperAdminRoutingModule } from './super-admin-routing.module';
import { LogsComponent } from '../admin/components/logs/logs.component';
import { SuperAdminLayoutComponent } from './components/super-admin-layout.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SuperAdminRoutingModule,
    SuperAdminSubnavComponent,
    LogsComponent,
    SuperAdminLayoutComponent
  ],
  declarations: [
    SuperAdminComponent
  ]
})
export class SuperAdminModule { }
