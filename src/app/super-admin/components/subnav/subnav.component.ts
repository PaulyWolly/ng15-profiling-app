import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-super-admin-subnav',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './subnav.component.html',
    styleUrls: ['./subnav.component.css']
})
export class SubNavComponent {
    constructor() {
        console.log('Super Admin SubNav Component initialized');
    }
}
