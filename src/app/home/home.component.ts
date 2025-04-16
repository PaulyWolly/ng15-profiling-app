import { Component } from '@angular/core';
import { AccountService } from '@app/_services';
import { Role } from '@app/_models';

@Component({
    templateUrl: 'home.component.html'
})
export class HomeComponent {
    Role = Role; // Expose Role enum to the template
    
    constructor(private accountService: AccountService) {}

    get account() {
        return this.accountService.accountValue;
    }
}
