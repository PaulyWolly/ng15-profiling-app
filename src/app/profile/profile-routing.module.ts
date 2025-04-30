import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './containers/layout/layout.component';
import { ProfileComponent } from './containers/profile/profile.component';
import { DetailsComponent } from './containers/details/details.component';
import { EditComponent } from './containers/edit/edit.component';
import { EditProfileComponent } from './containers/edit-profile/edit-profile.component';
import { AccountSettingsComponent } from './containers/account-settings/account-settings.component';
import { NewStandardViewComponent } from './components/new-standard-view/new-standard-view.component';
import { NewSocialMediaViewComponent } from '../profile-templates/views/new-social-media-view/new-social-media-view.component';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { 
                path: '', 
                component: DetailsComponent,
                pathMatch: 'full'
            },
            { path: 'edit', component: EditComponent },
            { path: 'update', component: EditProfileComponent },
            { path: 'account-settings', component: AccountSettingsComponent },
            { path: ':id', component: ProfileComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProfileRoutingModule { }