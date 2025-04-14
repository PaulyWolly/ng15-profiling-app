import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/_services';

@Component({
  selector: 'app-profile-image-display',
  template: `
    <div class="profile-image-container">
      <img *ngIf="imageUrl" [src]="imageUrl" class="profile-image" alt="Profile Image">
      <div *ngIf="!imageUrl" class="profile-image-placeholder">
        <mat-icon>person</mat-icon>
      </div>
      <p class="mt-2 text-center">
        <a routerLink="/profile" class="btn btn-link">Update Profile</a>
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

    .profile-image,
    .profile-image-placeholder {
      width: 200px;
      height: 280px;
      border-radius: 120px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      border: 2px solid #e0e0e0;
    }

    .profile-image {
      object-fit: contain;
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

  constructor(private accountService: AccountService) { }

  ngOnInit() {
    const account = this.accountService.accountValue;
    if (account?.profileImage) {
      this.imageUrl = account.profileImage;
    }
  }
} 