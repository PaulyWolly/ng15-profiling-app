import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Account } from '@app/_models';
import { MatDialog } from '@angular/material/dialog';
import { MapDialogComponent } from '@app/profile/components/map-dialog/map-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-new-business-profile',
  templateUrl: './new-business-profile.component.html',
  styleUrls: ['./new-business-profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule
  ]
})
export class NewBusinessProfileComponent implements OnInit {
  @Input() profile!: Account;
  @Input() isOwnProfile: boolean = false;
  
  imageLoading: boolean = true;
  
  constructor(private dialog: MatDialog) {}
  
  ngOnInit() {
    // Start with loading state if profile image exists
    this.imageLoading = !!this.profile?.profileImage;
  }
  
  onImageLoaded() {
    this.imageLoading = false;
    console.log('[BusinessProfile] Profile image loaded successfully');
  }
  
  onImageError() {
    this.imageLoading = false;
    // Clear the profile image URL in case of error
    if (this.profile) {
      console.error('[BusinessProfile] Error loading profile image');
      this.profile.profileImage = undefined;
    }
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
} 