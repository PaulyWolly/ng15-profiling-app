import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

// Material Modules (Keep essential ones needed globally)
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';

import { AppRoutingModule } from '@app/app-routing.module';
import { JwtInterceptor, ErrorInterceptor, appInitializer } from '@app/_helpers';
import { LogInterceptor } from '@app/_interceptors/log.interceptor';
import { AccountService } from '@app/_services';
import { ConfigService } from '@app/_services/config.service';
import { UserActionLoggerService } from '@app/_services/user-action-logger.service';
import { AppComponent } from '@app/app.component';
import { FooterComponent } from './footer/footer.component';
import { AdminModule } from './admin/admin.module';
import { SharedModule } from './shared/shared.module';
import { ProfileModule } from './profile/profile.module';
import { ProfileTemplatesModule } from './profile-templates/profile-templates.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { NewMenuBarComponent } from './new-menu-bar/new-menu-bar.component';
import { SubNavComponent as AdminSubNavComponent } from './admin/components/subnav/subnav.component';
import { SuperAdminSubnavComponent } from './super-admin/components/super-admin-subnav/super-admin-subnav.component';
import { InactivityDialogComponent } from './shared/components/inactivity-dialog/inactivity-dialog.component';

// Add factory function to initialize ConfigService
export function configInitializer(configService: ConfigService) {
    return () => configService.loadConfig();
}

// Add factory function to initialize the UserActionLoggerService
export function userActionLoggerInitializer(userActionLogger: UserActionLoggerService) {
    return () => {
        // The service starts tracking navigation automatically in its constructor
        // This ensures the service is instantiated on app start
        console.log('User action logger initialized');
        return Promise.resolve();
    };
}

@NgModule({
    declarations: [
        AppComponent,
        FooterComponent,
        NewMenuBarComponent,
        InactivityDialogComponent
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
        SuperAdminModule,
        AdminSubNavComponent,
        CommonModule,
        SuperAdminSubnavComponent,
        MatDialogModule
    ],
    providers: [
        { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AccountService] },
        { provide: APP_INITIALIZER, useFactory: configInitializer, multi: true, deps: [ConfigService] },
        { provide: APP_INITIALIZER, useFactory: userActionLoggerInitializer, multi: true, deps: [UserActionLoggerService] },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: LogInterceptor, multi: true },
        { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
        JwtHelperService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    bootstrap: [AppComponent],
    entryComponents: [InactivityDialogComponent]
})
export class AppModule { }
