import { NgModule } from '@angular/core';

// Shared Module
import { SharedModule } from '@app/shared/shared.module';

// Routing
import { AccountsRoutingModule } from './accounts-routing.module';

// Components
import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component';

@NgModule({
    imports: [
        SharedModule,
        AccountsRoutingModule
    ],
    declarations: [
        ListComponent,
        AddEditComponent
    ]
})
export class AccountsModule { }
