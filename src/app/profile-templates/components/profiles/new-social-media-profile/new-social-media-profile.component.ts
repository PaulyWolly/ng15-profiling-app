import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Account } from '@app/_models';
import { environment } from '@environments/environment';
import { CurvedBorderComponent } from '@app/shared/curved-border/curved-border.component';
import { CustomTooltipDirective } from '@app/shared/custom-tooltip/custom-tooltip.directive';

@Component({
  selector: 'app-new-social-media-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    CurvedBorderComponent,
    CustomTooltipDirective
  ],
  template: `
    <div class="social-card">
      <app-curved-border
        [top]="20"
        [left]="24"
        [right]="24"
        [height]="280"
        [borderColor]="'#eebbbb'"
        [borderWidth]="4"
        [borderRadius]="'var(--app-border-radius)'"
      ></app-curved-border>

      <div class="profile-card-top">
        <!-- Profile Image -->
        <div class="profile-image-wrapper">
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
          <a *ngIf="profile?.facebook" [href]="profile.facebook" target="_blank" class="social-icon" [appCustomTooltip]="'Visit my Facebook Profile'">
            <i class="fab fa-facebook-f"></i>
          </a>
          <a *ngIf="profile?.linkedin" [href]="profile.linkedin" target="_blank" class="social-icon" [appCustomTooltip]="'Visit my LinkedIn Profile'">
            <i class="fab fa-linkedin-in"></i>
          </a>
          <a *ngIf="profile?.website" [href]="profile.website" target="_blank" class="social-icon" [appCustomTooltip]="'Visit my Website'">
            <i class="fa-solid fa-globe"></i>
          </a>
          <a *ngIf="profile?.github" [href]="profile.github" target="_blank" class="social-icon" [appCustomTooltip]="'Visit my GitHub Profile'">
            <i class="fab fa-github"></i>
          </a>
        </div>
      </div>

      <div class="profile-card-bottom">
        <div class="stats-section">
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
              <div class="follower-avatar" *ngFor="let follower of profile.followerImages">
                <img [src]="getFollowerImageUrl(follower)" [alt]="follower.name" class="follower-image" [appCustomTooltip]="follower.title + ' - ' + follower.name"/>
              </div>
            </div>
            <div class="followers-you-know-label">{{profile.followerImages?.length}} followers you know</div>
          </div>

          <!-- Action Button -->
          <div class="action-buttons">
            <button mat-raised-button color="primary">Follow Me</button>
          </div>
        </div>
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
    if (!follower.imageUrl) return 'assets/images/default-avatar.png';
    return follower.imageUrl.startsWith('http') ? follower.imageUrl : environment.apiUrl + '/' + follower.imageUrl;
  }

  openGoogleMaps() {
    if (!this.profile.address) return;
    const query = encodeURIComponent(
      `${this.profile.address}${this.profile.city ? ', ' + this.profile.city : ''}${this.profile.state ? ', ' + this.profile.state : ''}${this.profile.zipCode ? ' ' + this.profile.zipCode : ''}`
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  }
} 