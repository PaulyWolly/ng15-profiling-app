import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileTemplatesComponent } from './profile-templates.component';

const routes: Routes = [
    {
        path: '',
        component: ProfileTemplatesComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProfileTemplatesRoutingModule { } 