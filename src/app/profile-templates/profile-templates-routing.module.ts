import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileTemplatesComponent } from './profile-templates.component';
import { NewStandardComponent } from './components/new-standard/new-standard.component';
import { NewSocialMediaViewComponent } from './views/new-social-media-view/new-social-media-view.component';
import { NewSocialMediaComponent } from './components/new-social-media/new-social-media.component';

const routes: Routes = [
    {
        path: '',
        component: ProfileTemplatesComponent
    },
    {
        path: 'standard',
        component: NewStandardComponent
    },
    {
        path: 'social-media',
        component: NewSocialMediaViewComponent
    },
    {
        path: 'new-social-media',
        component: NewSocialMediaComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProfileTemplatesRoutingModule { } 