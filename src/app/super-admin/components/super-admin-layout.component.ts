import { Component } from '@angular/core';
import { SuperAdminSubnavComponent } from './super-admin-subnav/super-admin-subnav.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-super-admin-layout',
  templateUrl: './super-admin-layout.component.html',
  styleUrls: ['./super-admin-layout.component.css'],
  standalone: true,
  imports: [SuperAdminSubnavComponent, RouterOutlet]
})
export class SuperAdminLayoutComponent {}
