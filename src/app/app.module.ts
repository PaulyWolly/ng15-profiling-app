import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

// Material Modules (Keep essential ones needed globally)
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AppRoutingModule } from '@app/app-routing.module';
import { JwtInterceptor, ErrorInterceptor, appInitializer } from '@app/_helpers';
import { AccountService } from '@app/_services';
import { ConfigService } from '@app/_services/config.service';
import { AppComponent } from '@app/app.component';
import { AlertComponent } from '@app/shared/components/alert/alert.component';
import { FooterComponent } from './footer/footer.component';
import { AdminModule } from './admin/admin.module';

// Add factory function to initialize ConfigService
export function configInitializer(configService: ConfigService) {
    return () => configService.loadConfig();
}

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule,
        AppRoutingModule,
        MatIconModule,
        MatButtonModule,
        AdminModule
    ],
    declarations: [
        AppComponent,
        AlertComponent,
        FooterComponent
    ],
    providers: [
        { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AccountService] },
        { provide: APP_INITIALIZER, useFactory: configInitializer, multi: true, deps: [ConfigService] },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
