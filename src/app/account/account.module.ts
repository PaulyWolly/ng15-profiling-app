import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AccountRoutingModule } from './account-routing.module';
import { LoginComponent } from './components/login/login.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { LayoutComponent } from './components/layout/layout.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        AccountRoutingModule
    ],
    declarations: [
        LoginComponent,
        ResetPasswordComponent,
        RegisterComponent,
        ForgotPasswordComponent,
        LayoutComponent
    ]
})
export class AccountModule { }