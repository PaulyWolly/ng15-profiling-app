import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterModule } from '@angular/router';
import { Account } from '@app/_models';
import { AccountService, AlertService } from '@app/_services';
import { first } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MapDialogComponent } from '../map-dialog/map-dialog.component';

@Component({
  selector: 'app-new-social-media',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatBadgeModule,
    RouterModule
  ],
  template: `
    <div class="social-profile-container">
      <!-- Cover Image Section -->
      <div class="cover-image">
        <img *ngIf="profile?.coverImage" [src]="profile.coverImage" alt="Cover photo">
        <div *ngIf="!profile?.coverImage" class="default-cover"></div>
        
        <!-- Profile Navigation -->
        <div class="profile-nav">
          <button mat-button class="nav-item active">Posts</button>
          <button mat-button class="nav-item">About</button>
          <button mat-button class="nav-item">Photos</button>
          <button mat-button class="nav-item">Friends</button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="content-layout">
        <!-- Left Sidebar -->
        <div class="sidebar">
          <!-- Profile Card -->
          <mat-card class="profile-card">
            <div class="profile-header">
              <!-- Profile Image -->
              <div class="profile-image-container">
                <img *ngIf="profile?.profileImage" 
                     [src]="profile.profileImage" 
                     [alt]="profile.firstName + ' ' + profile.lastName"
                     class="profile-image"
                     (load)="onImageLoaded()"
                     (error)="onImageError()">
                <mat-icon *ngIf="!profile?.profileImage" class="default-avatar">account_circle</mat-icon>
              </div>

              <!-- Profile Info -->
              <div class="profile-info">
                <div class="name-section">
                  <h1>{{ profile.firstName }} {{ profile.lastName }}</h1>
                  <span class="username" *ngIf="profile?.username">{{'@' + profile.username}}</span>
                </div>
                
                <p class="bio" *ngIf="profile?.bio">{{ profile.bio }}</p>

                <div class="location-info" *ngIf="profile?.city || profile?.state">
                  <mat-icon>location_on</mat-icon>
                  <span>{{ profile.city }}, {{ profile.state }}</span>
                </div>

                <div class="stats-section">
                  <div class="stat-item">
                    <span class="count">{{ profile.followersCount || 0 }}</span>
                    <span class="label">Followers</span>
                  </div>
                  <div class="stat-item">
                    <span class="count">{{ profile.followingCount || 0 }}</span>
                    <span class="label">Following</span>
                  </div>
                </div>

                <div class="action-buttons" *ngIf="isOwnProfile">
                  <button mat-raised-button color="primary" routerLink="/profile/edit">
                    <mat-icon>edit</mat-icon>
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </mat-card>

          <!-- Social Links Card -->
          <mat-card class="social-links-card">
            <mat-card-header>
              <mat-card-title>Social Links</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="social-link" *ngIf="profile?.website">
                <mat-icon>language</mat-icon>
                <a [href]="profile.website" target="_blank">Website</a>
              </div>
              <div class="social-link" *ngIf="profile?.github">
                <mat-icon>code</mat-icon>
                <a [href]="profile.github" target="_blank">GitHub</a>
              </div>
              <div class="social-link" *ngIf="profile?.linkedin">
                <mat-icon>work</mat-icon>
                <a [href]="profile.linkedin" target="_blank">LinkedIn</a>
              </div>
              <div class="social-link" *ngIf="profile?.twitter">
                <mat-icon>chat</mat-icon>
                <a [href]="profile.twitter" target="_blank">Twitter</a>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <!-- Create Post Card -->
          <mat-card class="create-post-card" *ngIf="isOwnProfile">
            <mat-card-content>
              <div class="post-input">
                <mat-icon class="avatar-icon">account_circle</mat-icon>
                <button mat-button class="post-button">What's on your mind?</button>
              </div>
              <mat-divider></mat-divider>
              <div class="post-actions">
                <button mat-button>
                  <mat-icon>photo_camera</mat-icon>
                  Photo
                </button>
                <button mat-button>
                  <mat-icon>videocam</mat-icon>
                  Video
                </button>
                <button mat-button>
                  <mat-icon>event</mat-icon>
                  Event
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Activity Feed -->
          <div class="activity-feed">
            <mat-card class="post-card" *ngFor="let i of [1,2,3]">
              <mat-card-header>
                <div mat-card-avatar class="post-avatar">
                  <mat-icon>account_circle</mat-icon>
                </div>
                <mat-card-title>{{ profile.firstName }} {{ profile.lastName }}</mat-card-title>
                <mat-card-subtitle>2 hours ago</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p>This is a sample post content. We'll replace this with real content later.</p>
              </mat-card-content>
              <mat-divider></mat-divider>
              <mat-card-actions>
                <button mat-button>
                  <mat-icon>thumb_up</mat-icon>
                  Like
                </button>
                <button mat-button>
                  <mat-icon>comment</mat-icon>
                  Comment
                </button>
                <button mat-button>
                  <mat-icon>share</mat-icon>
                  Share
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .social-profile-container {
      max-width: 1200px;
      margin: 0 auto;
      background-color: #f0f2f5;
      min-height: 100vh;
    }

    .cover-image {
      height: 350px;
      width: 100%;
      overflow: hidden;
      position: relative;
      background-color: white;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .default-cover {
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #1da1f2, #0d8bd9);
      }
    }

    .profile-nav {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.9);
      padding: 0 20px;
      display: flex;
      gap: 20px;

      .nav-item {
        padding: 15px 20px;
        color: #65676b;
        font-weight: 600;
        border-radius: 0;

        &.active {
          color: #1877f2;
          border-bottom: 3px solid #1877f2;
        }

        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
      }
    }

    .content-layout {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 20px;
      padding: 20px;
      margin-top: -80px;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .profile-card {
      border-radius: 8px;
      background: white;
      overflow: visible;
    }

    .profile-header {
      padding: 20px;
    }

    .profile-image-container {
      margin-top: -100px;
      margin-bottom: 20px;

      .profile-image {
        width: 168px;
        height: 168px;
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        background-color: white;
      }

      .default-avatar {
        width: 168px;
        height: 168px;
        font-size: 168px;
        color: #bdbdbd;
      }
    }

    .profile-info {
      .name-section {
        h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #1c1e21;
        }

        .username {
          color: #65676b;
          font-size: 15px;
          margin-left: 8px;
        }
      }

      .bio {
        margin: 16px 0;
        font-size: 15px;
        line-height: 1.5;
        color: #65676b;
      }

      .location-info {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #65676b;
        margin: 12px 0;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }
    }

    .stats-section {
      display: flex;
      gap: 24px;
      margin: 20px 0;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;

        .count {
          font-size: 20px;
          font-weight: 700;
          color: #1c1e21;
        }

        .label {
          color: #65676b;
          font-size: 13px;
        }
      }
    }

    .social-links-card {
      border-radius: 8px;

      mat-card-header {
        padding: 16px;
        
        mat-card-title {
          font-size: 17px;
          font-weight: 600;
          margin: 0;
        }
      }

      .social-link {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        
        mat-icon {
          color: #65676b;
        }

        a {
          color: #1877f2;
          text-decoration: none;
          font-size: 15px;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .main-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .create-post-card {
      border-radius: 8px;

      .post-input {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;

        .avatar-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
          color: #65676b;
        }

        .post-button {
          flex: 1;
          text-align: left;
          background-color: #f0f2f5;
          border-radius: 20px;
          color: #65676b;
        }
      }

      .post-actions {
        display: flex;
        justify-content: space-around;
        padding: 8px;

        button {
          flex: 1;
          color: #65676b;

          mat-icon {
            margin-right: 8px;
          }
        }
      }
    }

    .post-card {
      border-radius: 8px;

      mat-card-header {
        padding: 16px 16px 0;

        .post-avatar {
          background-color: #f0f2f5;
          display: flex;
          align-items: center;
          justify-content: center;

          mat-icon {
            color: #65676b;
          }
        }

        mat-card-title {
          font-size: 15px;
          font-weight: 600;
        }

        mat-card-subtitle {
          font-size: 13px;
        }
      }

      mat-card-content {
        padding: 16px;
        font-size: 15px;
        color: #1c1e21;
      }

      mat-card-actions {
        display: flex;
        justify-content: space-around;
        padding: 8px;

        button {
          flex: 1;
          color: #65676b;

          mat-icon {
            margin-right: 8px;
          }
        }
      }
    }
  `]
})
export class NewSocialMediaComponent implements OnInit {
  @Input() profile!: Account;
  @Input() isOwnProfile: boolean = false;
  
  imageLoading: boolean = true;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  
  constructor(
    private accountService: AccountService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {}
  
  ngOnInit() {
    // Start with loading state if profile image exists
    this.imageLoading = !!this.profile?.profileImage;
  }
  
  onImageLoaded() {
    this.imageLoading = false;
    console.log('[NewSocialMedia] Profile image loaded successfully');
  }
  
  onImageError() {
    this.imageLoading = false;
    // Clear the profile image URL in case of error
    if (this.profile) {
      console.error('[NewSocialMedia] Error loading profile image');
      this.profile.profileImage = undefined;
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadImage() {
    if (!this.selectedFile || !this.profile?.id) {
      this.alertService.error('No image selected or profile not found');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', this.selectedFile);
    formData.append('userEmail', this.profile.email || '');

    this.accountService.uploadImage(this.profile.id, formData)
      .pipe(first())
      .subscribe({
        next: (response) => {
          this.alertService.success('Image uploaded successfully');
          this.selectedFile = null;
          this.previewUrl = null;
          
          // Update the local profile image if needed
          if (response.profileImage && this.profile) {
            this.profile.profileImage = response.profileImage;
          }
        },
        error: (error) => {
          this.alertService.error('Image upload failed');
          console.error('[NewSocialMedia] Upload failed:', error);
        }
      });
  }
  
  // Open the map dialog with the profile address
  openMapDialog(): void {
    this.dialog.open(MapDialogComponent, {
      width: '600px',
      data: {
        address: this.profile?.address || '',
        city: this.profile?.city || '',
        state: this.profile?.state || '',
        zipCode: this.profile?.zipCode || ''
      }
    });
  }
  
  // Check if the profile has any follower images
  hasFollowers(): boolean {
    return !!this.profile?.followerImages && this.profile.followerImages.length > 0;
  }
} 