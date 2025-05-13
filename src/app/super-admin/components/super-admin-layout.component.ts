import { Component, OnInit } from '@angular/core';
import { SuperAdminSubnavComponent } from './super-admin-subnav/super-admin-subnav.component';
import { RouterOutlet, Router } from '@angular/router';
import { AccountService } from '@app/_services/account.service';

@Component({
  selector: 'app-super-admin-layout',
  templateUrl: './super-admin-layout.component.html',
  styleUrls: ['./super-admin-layout.component.css'],
  standalone: true,
  imports: [SuperAdminSubnavComponent, RouterOutlet]
})
export class SuperAdminLayoutComponent implements OnInit {
  constructor(
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.accountService.accountValue) {
      this.accountService.refreshToken().subscribe({
        next: () => {
          // Stay on the current page
        },
        error: () => {
          this.accountService.logout();
        }
      });
    }
  }
}
