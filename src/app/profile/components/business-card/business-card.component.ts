import { Component, Input, OnInit } from '@angular/core';
import { Account } from '@app/_models';
import { MatDialog } from '@angular/material/dialog';
import { MapDialogComponent } from '../map-dialog/map-dialog.component';

@Component({
  selector: 'app-business-card',
  templateUrl: './business-card.component.html',
  styleUrls: ['./business-card.component.css']
})
export class BusinessCardComponent implements OnInit {
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
    console.log('[BusinessCard] Profile image loaded successfully');
  }
  
  onImageError() {
    this.imageLoading = false;
    // Clear the profile image URL in case of error
    if (this.profile) {
      console.error('[BusinessCard] Error loading profile image');
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