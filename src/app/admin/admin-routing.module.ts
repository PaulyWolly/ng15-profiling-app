import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubNavComponent } from './components/subnav/subnav.component';
import { LayoutComponent } from './components/layout/layout.component';
import { OverviewComponent } from './components/overview/overview.component';
import { MonitorComponent } from './components/monitor/monitor.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ScriptsComponent } from './scripts/scripts.component';

const routes: Routes = [
  { 
    path: '', 
    component: SubNavComponent, 
    outlet: 'subnav'
  },
  { 
    path: '', 
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'monitor', component: MonitorComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'scripts', component: ScriptsComponent },
      // Add accounts route
      { path: 'accounts', loadChildren: () => import('./accounts/accounts.module').then(m => m.AccountsModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }