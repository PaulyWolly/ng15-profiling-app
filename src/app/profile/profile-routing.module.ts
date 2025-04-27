import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './containers/layout/layout.component';
import { ProfileComponent } from './containers/profile/profile.component';
import { DetailsComponent } from './containers/details/details.component';
import { EditComponent } from './containers/edit/edit.component';
import { UpdateComponent } from './containers/update/update.component';
import { AccountSettingsComponent } from './containers/account-settings/account-settings.component';
import { NewStandardViewComponent } from './components/new-standard-view/new-standard-view.component';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', component: DetailsComponent, pathMatch: 'full' },
            { path: 'edit', component: EditComponent },
            { path: 'update', component: UpdateComponent },
            { path: 'account-settings', component: AccountSettingsComponent },
            { path: 'new-standard', component: NewStandardViewComponent },
            { path: ':id', component: ProfileComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProfileRoutingModule { }