import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountService } from '@app/_services';
import { Role } from '@app/_models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-image-display',
  template: `
    <div class="profile-image-container">
      <div class="oval-container" [class.loading]="loading">
        <img *ngIf="imageUrl" [src]="imageUrl" alt="Profile Image" (load)="onImageLoaded()" (error)="onImageError()">
        <div *ngIf="!imageUrl && !loading" class="profile-image-placeholder">
          <mat-icon>person</mat-icon>
        </div>
        <div *ngIf="loading" class="loading-spinner">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      </div>
      <p class="mt-2 text-center">
        <a *ngIf="isAdmin" [routerLink]="['/admin/accounts/edit', userId]" class="btn btn-link update-link">Update Your Account</a>
        <a *ngIf="!isAdmin" routerLink="/profile" class="btn btn-link">View Your Profile</a>
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
      position: relative;
    }

    .oval-container.loading {
      background-color: #f0f0f0;
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

    .loading-spinner {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }
    
    .update-link {
      font-size: 1rem;
      font-weight: normal;
      text-decoration: none;
    }
    
    .update-link:hover {
      text-decoration: underline;
    }
  `]
})
export class ProfileImageDisplayComponent implements OnInit, OnDestroy {
  imageUrl: string | null = null;
  userId: string | null = null;
  isAdmin = false;
  loading = true;
  private accountSubscription?: Subscription;

  constructor(private accountService: AccountService) { }

  ngOnInit() {
    // First try to get the current value
    this.updateFromAccount(this.accountService.accountValue);
    
    // Then subscribe to changes to keep it updated
    this.accountSubscription = this.accountService.account.subscribe(account => {
      console.log('[ProfileImageDisplay] Account updated:', account?.id);
      this.updateFromAccount(account);
    });
  }
  
  ngOnDestroy() {
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
  }
  
  private updateFromAccount(account: any) {
    if (account?.id) {
      this.userId = account.id;
      this.isAdmin = account.role === Role.Admin;
      
      // If profile image URL changed, update and show loading state
      if (account.profileImage !== this.imageUrl) {
        this.loading = true;
        this.imageUrl = account.profileImage;
        
        // If no image URL is provided, don't show a loading state
        if (!this.imageUrl) {
          this.loading = false;
        }
      }
    } else {
      this.userId = null;
      this.isAdmin = false;
      this.imageUrl = null;
      this.loading = false;
    }
  }
  
  onImageLoaded() {
    console.log('[ProfileImageDisplay] Image loaded successfully');
    this.loading = false;
  }
  
  onImageError() {
    console.error('[ProfileImageDisplay] Error loading image');
    this.imageUrl = null;
    this.loading = false;
  }
} 