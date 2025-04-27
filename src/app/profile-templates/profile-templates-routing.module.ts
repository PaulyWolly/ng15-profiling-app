import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileTemplatesComponent } from './profile-templates.component';
import { NewStandardComponent } from './components/new-standard/new-standard.component';
import { NewSocialMediaComponent as SocialMediaPreviewComponent } from './components/new-social-media/new-social-media.component';

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
        component: SocialMediaPreviewComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProfileTemplatesRoutingModule { } 