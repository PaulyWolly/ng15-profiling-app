import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubNavComponent } from './subnav.component';
import { LayoutComponent } from './layout.component';
import { OverviewComponent } from './overview.component';
import { MonitorComponent } from './monitor.component';
import { SettingsComponent } from './settings.component';

// Lazy load accounts module
const accountsModule = () => import('./accounts/accounts.module').then(x => x.AccountsModule);

const routes: Routes = [
    // Named outlet for subnav with admin menu
    { 
        path: '', 
        component: SubNavComponent, 
        outlet: 'subnav'
    },
    // Main content routes
    { 
        path: '', 
        component: LayoutComponent,
        children: [
            // Redirect empty path to overview
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            // Admin overview page with its own path
            { path: 'overview', component: OverviewComponent, runGuardsAndResolvers: 'always' },
            // User session monitoring
            { path: 'monitor', component: MonitorComponent, runGuardsAndResolvers: 'always' },
            // System settings
            { path: 'settings', component: SettingsComponent, runGuardsAndResolvers: 'always' },
            // Accounts management
            { path: 'accounts', loadChildren: accountsModule }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }