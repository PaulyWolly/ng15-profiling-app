import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuperAdminComponent } from './super-admin/super-admin.component';
import { SuperAdminSubnavComponent } from './components/super-admin-subnav/super-admin-subnav.component';
import { LogsComponent } from '../admin/components/logs/logs.component'; // Adjust path if needed
import { SuperAdminLayoutComponent } from './components/super-admin-layout.component';
import { superAdminGuard } from '../guards/super-admin.guard';

const routes: Routes = [
  {
    path: '',
    component: SuperAdminLayoutComponent,
    canActivateChild: [superAdminGuard],
    children: [
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
