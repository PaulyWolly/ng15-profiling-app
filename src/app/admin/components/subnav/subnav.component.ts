import { Component } from '@angular/core';

@Component({
    selector: 'app-admin-subnav',
    templateUrl: './subnav.component.html',
    styleUrls: ['./subnav.component.css']
})
export class SubNavComponent {
    constructor() {
        console.log('Admin SubNav Component initialized');
    }
}