import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/_services';
import { Role } from '@app/_models';

@Component({
  selector: 'app-profile-image-display',
  template: `
    <div class="profile-image-container">
      <div class="oval-container">
        <img *ngIf="imageUrl" [src]="imageUrl" alt="Profile Image">
        <div *ngIf="!imageUrl" class="profile-image-placeholder">
          <mat-icon>person</mat-icon>
        </div>
      </div>
      <p class="mt-2 text-center">
        <a *ngIf="isAdmin" [routerLink]="['/admin/accounts/edit', userId]" class="btn btn-link">Update Profile</a>
        <a *ngIf="!isAdmin" routerLink="/profile/edit" class="btn btn-link">Update Profile</a>
      </p>
    </div>
  `,
  styles: [`
    .profile-image-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .oval-container {
      width: 200px;
      height: 280px;
      border-radius: 120px;
      overflow: hidden;
      background-color: #f5f5f5;
      border: 2px solid #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .oval-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .profile-image-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    .profile-image-placeholder mat-icon {
      font-size: 100px;
      width: 100px;
      height: 100px;
      color: #9e9e9e;
    }
  `]
})
export class ProfileImageDisplayComponent implements OnInit {
  imageUrl: string | null = null;
  userId: string | null = null;
  isAdmin = false;

  constructor(private accountService: AccountService) { }

  ngOnInit() {
    const account = this.accountService.accountValue;
    if (account?.id) {
      this.userId = account.id;
      this.isAdmin = account.role === Role.Admin;
      if (account.profileImage) {
        this.imageUrl = account.profileImage;
      }
    }
  }
} 