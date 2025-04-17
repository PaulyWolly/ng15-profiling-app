import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

// Material Modules (Keep essential ones needed globally or in HomeModule)
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
// Remove Material Table modules if only used in AdminModule
// import { MatTableModule } from '@angular/material/table';
// import { MatPaginatorModule } from '@angular/material/paginator';
// import { MatSortModule } from '@angular/material/sort';

import { AppRoutingModule } from '@app/app-routing.module';
import { JwtInterceptor, ErrorInterceptor, appInitializer } from '@app/_helpers';
import { AccountService } from '@app/_services';
import { AppComponent } from '@app/app.component';
import { AlertComponent } from '@app/_components';
import { HomeModule } from '@app/home/home.module';
import { FooterComponent } from '@app/footer/footer.component';

// Import AdminModule instead of individual components
import { AdminModule } from './admin/admin.module';


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule,
        AppRoutingModule,
        MatIconModule,    // Keep necessary global Material Modules
        MatButtonModule,
        // Remove MatTable, MatPaginator, MatSort if moved to AdminModule
        HomeModule,
        AdminModule       // Import AdminModule
    ],
    declarations: [
        AppComponent,
        AlertComponent,
        FooterComponent
        // Removed Admin components declarations
    ],
    providers: [
        { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AccountService] },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
