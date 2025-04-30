import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Account } from '@app/_models';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-new-social-media',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="social-card">
      <div class="profile-card-top">
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
          <a *ngIf="profile?.facebook" [href]="profile.facebook" target="_blank" class="social-icon">
            <i class="fab fa-facebook-f"></i>
          </a>
          <a *ngIf="profile?.linkedin" [href]="profile.linkedin" target="_blank" class="social-icon">
            <i class="fab fa-linkedin-in"></i>
          </a>
          <a *ngIf="profile?.website" [href]="profile.website" target="_blank" class="social-icon">
            <i class="fas fa-globe"></i>
          </a>
          <a *ngIf="profile?.github" [href]="profile.github" target="_blank" class="social-icon">
            <i class="fab fa-github"></i>
          </a>
        </div>
      </div>

      <div class="profile-card-bottom">
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
              <img [src]="getFollowerImageUrl(follower)" [alt]="follower.name" class="follower-image" [title]="follower.title || ''">
            </div>
          </div>
          <div class="followers-you-know-label">{{profile.followerImages?.length}} followers you know</div>
        </div>

        <!-- Action Button -->
        <div class="action-buttons">
          <button mat-raised-button>Follow Me</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./new-social-media.component.scss']
})
export class NewSocialMediaComponent implements OnInit {
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
    // If the path is already provided and contains the extension, use it
    if (follower.path?.includes('.png')) {
      return `${baseUrl}/uploads/followers/followerImage-${formattedName}.png`;
    }
    // Default to png for the known followers
    if (['daffy_duck', 'tom_jones', 'jesus_christ'].includes(formattedName)) {
      return `${baseUrl}/uploads/followers/followerImage-${formattedName}.png`;
    }
    // For any new followers, use jpg as default
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