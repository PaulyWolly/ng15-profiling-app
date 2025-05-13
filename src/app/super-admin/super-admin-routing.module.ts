import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuperAdminComponent } from './super-admin/super-admin.component';
import { SuperAdminSubnavComponent } from './components/super-admin-subnav/super-admin-subnav.component';
import { LogsComponent } from '../admin/components/logs/logs.component'; // Adjust path if needed
import { SuperAdminLayoutComponent } from './components/super-admin-layout.component';
import { superAdminGuard } from '../guards/super-admin.guard';
import { SuperAdminOverviewComponent } from './components/super-admin-overview.component';

const routes: Routes = [
  {
    path: '',
    component: SuperAdminSubnavComponent,
    outlet: 'subnav'
  },
  {
    path: '',
    component: SuperAdminLayoutComponent,
    canActivateChild: [superAdminGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: SuperAdminOverviewComponent },
      { path: 'logs', component: LogsComponent }
      // Add more sub-nav links here as needed
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuperAdminRoutingModule {}
