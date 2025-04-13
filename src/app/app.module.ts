import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AppRoutingModule } from '@app/app-routing.module';
import { JwtInterceptor, ErrorInterceptor, appInitializer } from '@app/_helpers';
import { AccountService } from '@app/_services';
import { AppComponent } from '@app/app.component';
import { AlertComponent } from '@app/_components';
import { HomeComponent } from '@app/home';
import { FooterComponent } from '@app/footer/footer.component';

// import { AdminModule } from './admin/admin.module';


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        HttpClientModule,
        AppRoutingModule,
        MatIconModule,
        MatButtonModule
    ],
    declarations: [
        AppComponent,
        AlertComponent,
        HomeComponent,
        FooterComponent
    ],
    providers: [
        { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AccountService] },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
