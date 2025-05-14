import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubNavComponent } from './components/subnav/subnav.component';
import { SuperAdminLayoutComponent } from './components/super-admin-layout/super-admin-layout.component';
import { OverviewComponent } from './components/overview/overview.component';
import { MonitorComponent } from './components/monitor/monitor.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ScriptsComponent } from './components/scripts/scripts.component';
import { LogsComponent } from './components/logs/logs.component';
import { SuperAdminOverviewComponent } from './components/super-admin-overview/super-admin-overview.component';

const routes: Routes = [
  {
    path: '',
    component: SubNavComponent,
    outlet: 'subnav'
  },
  {
    path: '',
    component: SuperAdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: SuperAdminOverviewComponent },
      { path: 'monitor', component: MonitorComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'scripts', component: ScriptsComponent },
      { path: 'logs', component: LogsComponent },
      // Add accounts route
      { path: 'accounts', loadChildren: () => import('./accounts/accounts.module').then(m => m.AccountsModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuperAdminRoutingModule { }
