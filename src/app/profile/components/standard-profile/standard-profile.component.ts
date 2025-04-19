import { Component, Input, OnInit } from '@angular/core';
import { Account } from '@app/_models';
import { MatDialog } from '@angular/material/dialog';
import { MapDialogComponent } from '../map-dialog/map-dialog.component';

@Component({
  selector: 'app-standard-profile',
  templateUrl: './standard-profile.component.html',
  styleUrls: ['./standard-profile.component.css']
})
export class StandardProfileComponent implements OnInit {
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
    console.log('[StandardProfile] Profile image loaded successfully');
  }
  
  onImageError() {
    this.imageLoading = false;
    // Clear the profile image URL in case of error
    if (this.profile) {
      console.error('[StandardProfile] Error loading profile image');
      this.profile.profileImage = undefined;
    }
  }
  
  // Open the map dialog with the profile address
  openMapDialog(): void {
    this.dialog.open(MapDialogComponent, {
      data: {
        address: this.profile?.address || '',
        city: this.profile?.city || '',
        state: this.profile?.state || '',
        zipCode: this.profile?.zipCode || ''
      }
    });
  }
} 