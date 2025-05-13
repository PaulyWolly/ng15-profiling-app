import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';

// Material Modules (Keep essential ones needed globally)
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';

import { AppRoutingModule } from '@app/app-routing.module';
import { JwtInterceptor, ErrorInterceptor, appInitializer } from '@app/_helpers';
import { AccountService } from '@app/_services';
import { ConfigService } from '@app/_services/config.service';
import { AppComponent } from '@app/app.component';
import { FooterComponent } from './footer/footer.component';
import { AdminModule } from './admin/admin.module';
import { SharedModule } from './shared/shared.module';
import { ProfileModule } from './profile/profile.module';
import { ProfileTemplatesModule } from './profile-templates/profile-templates.module';
import { SuperAdminComponent } from './super-admin/super-admin/super-admin.component';
import { NewMenuBarComponent } from './new-menu-bar/new-menu-bar.component';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { SuperAdminSubnavComponent } from './super-admin/components/super-admin-subnav/super-admin-subnav.component';
import { SubNavComponent } from './admin/components/subnav/subnav.component';

// Add factory function to initialize ConfigService
export function configInitializer(configService: ConfigService) {
    return () => configService.loadConfig();
}

@NgModule({
    declarations: [
        AppComponent,
        FooterComponent,
        NewMenuBarComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule,
        MatSnackBarModule,
        MatIconModule,
        MatButtonModule,
        MatBadgeModule,
        AppRoutingModule,
        AdminModule,
        SharedModule,
        ProfileModule,
        ProfileTemplatesModule,
        // SuperAdminModule,
        SuperAdminSubnavComponent,
        SubNavComponent
    ],
    providers: [
        { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AccountService] },
        { provide: APP_INITIALIZER, useFactory: configInitializer, multi: true, deps: [ConfigService] },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
        JwtHelperService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
