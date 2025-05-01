import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { Account } from '@app/_models';
import { environment } from '@environments/environment';
import { CustomTooltipDirective } from '@app/shared/custom-tooltip/custom-tooltip.directive';
import { CurvedBorderComponent } from "@app/shared/curved-border/curved-border.component";

@Component({
  selector: 'app-new-social-media-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    RouterModule,
    CustomTooltipDirective,
    CurvedBorderComponent
  ],
  template: `
    <div class="social-card">
      <app-curved-border
        [top]="20"
        [left]="24"
        [right]="24"
        [height]="300"
        [borderColor]="'#eebbbb'"
        [borderWidth]="4"
        [borderRadius]="24"
      ></app-curved-border>

      <!-- Profile Image -->
      <div class="profile-image-container" [class.loading]="loading">
        <img *ngIf="profile?.profileImage" 
            [src]="profile.profileImage" 
            alt="Profile picture"
            class="profile-img"
            (load)="onImageLoaded()"
            (error)="onImageError()">
        <div *ngIf="!profile?.profileImage && !loading" class="default-avatar">
          <mat-icon class="large-icon">account_circle</mat-icon>
        </div>
        <div *ngIf="loading" class="loading-spinner">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      </div>

      <!-- Profile Info -->
      <h2>{{profile.firstName}} {{profile.lastName}}</h2>
      <p class="text-muted">{{profile.position || 'Professional Title'}}</p>
      
      <!-- Location with Google Maps Link -->
      <p class="location" *ngIf="profile?.address" (click)="openGoogleMaps()">
        <mat-icon class="location-icon">location_on</mat-icon>
        {{profile.address}}{{profile.city ? ', ' + profile.city : ''}}{{profile.state ? ', ' + profile.state : ''}}{{profile.zipCode ? ' ' + profile.zipCode : ''}}
      </p>

      <!-- Social Links -->
      <div class="social-icons">
        <a
          *ngIf="profile?.facebook"
          [href]="profile.facebook"
          appCustomTooltip="Visit my Facebook/Meta Profile"
          tooltipBgColor="#222"
          tooltipTextColor="#fff"
          tooltipFont="Arial"
          tooltipBorder="1px solid #00f"
          target="_blank"
          class="social-icon"
        >
          <i class="fab fa-facebook-f"></i>
        </a>
        <a
          *ngIf="profile?.linkedin"
          [href]="profile.linkedin"
          appCustomTooltip="Visit my LinkedIn Profile"
          tooltipBgColor="#222"
          tooltipTextColor="#fff"
          tooltipFont="Arial"
          tooltipBorder="1px solid #00f"
          target="_blank"
          class="social-icon"
        >
          <i class="fab fa-linkedin-in"></i>
        </a>
        <a
          *ngIf="profile?.website"
          [href]="profile.website"
          appCustomTooltip="Visit my website"
          tooltipBgColor="#222"
          tooltipTextColor="#fff"
          tooltipFont="Arial"
          tooltipBorder="1px solid #00f"
          target="_blank"
          class="social-icon"
        >
          <i class="fa-solid fa-globe"></i>
        </a>
        <a
          *ngIf="profile?.github"
          [href]="profile.github"
          appCustomTooltip="Visit my github repository"
          tooltipBgColor="#222"
          tooltipTextColor="#fff"
          tooltipFont="Arial"
          tooltipBorder="1px solid #00f"
          target="_blank"
          class="social-icon"
        >
          <i class="fab fa-github"></i>
        </a>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-block">
          <div class="stat-number">{{profile.followersCount || 0}}</div>
          <div class="stat-label">Followers</div>
        </div>
        <div class="stat-block">
          <div class="stat-number">{{profile.followingCount || 0}}</div>
          <div class="stat-label">Following</div>
        </div>
      </div>

      <!-- Followers Preview -->
      <div class="followers-preview" *ngIf="profile?.followerImages?.length">
        <div class="follower-avatars">
          <div class="follower-avatar" *ngFor="let follower of profile?.followerImages">
            <img
              [src]="getFollowerImageUrl(follower)"
              [alt]="follower.name"
              class="follower-image"
              appCustomTooltip="{{follower.title}} - {{follower.name}}"
              tooltipBgColor="#e8e3cc"
              tooltipTextColor="#222"
              tooltipFont="Verdana"
              tooltipBorder="1px solid #888"
            />
          </div>
        </div>
        <div class="followers-you-know-label">{{profile.followerImages?.length}} followers you know</div>
      </div>

      <!-- Action Button -->
      <div class="action-buttons">
        <button mat-raised-button>Follow Me</button>
      </div>
    </div>
  `,
  styleUrls: ['./new-social-media-profile.component.scss']
})
export class NewSocialMediaProfileComponent implements OnInit {
  @Input() profile!: Account;
  @Input() isOwnProfile: boolean = false;

  loading = false;

  constructor(private router: Router) {}
  
  ngOnInit() {}
  
  onImageLoaded() {
    this.loading = false;
  }
  
  onImageError() {
    this.loading = false;
  }

  getFollowerImageUrl(follower: any): string {
    const baseUrl = environment.apiUrl || 'http://localhost:5001';
    const formattedName = follower.name.toLowerCase().replace(/\s+/g, '_');
    if (follower.path?.includes('.png')) {
      return `${baseUrl}/uploads/followers/followerImage-${formattedName}.png`;
    }
    if (['daffy_duck', 'tom_jones', 'jesus_christ'].includes(formattedName)) {
      return `${baseUrl}/uploads/followers/followerImage-${formattedName}.png`;
    }
    return `${baseUrl}/uploads/followers/followerImage-${formattedName}.jpg`;
  }

  openGoogleMaps() {
    if (this.profile) {
      const address = [
        this.profile.address,
        this.profile.city,
        this.profile.state,
        this.profile.zipCode
      ].filter(Boolean).join(', ');

      const query = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  }
} 