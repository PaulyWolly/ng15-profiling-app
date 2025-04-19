import { Component, Input, OnInit } from '@angular/core';
import { Account } from '@app/_models';
import { AccountService, AlertService } from '@app/_services';
import { first } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MapDialogComponent } from '../map-dialog/map-dialog.component';

@Component({
  selector: 'app-social-media',
  templateUrl: './social-media.component.html',
  styleUrls: ['./social-media.component.css']
})
export class SocialMediaComponent implements OnInit {
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
    console.log('[SocialMedia] Profile image loaded successfully');
  }
  
  onImageError() {
    this.imageLoading = false;
    // Clear the profile image URL in case of error
    if (this.profile) {
      console.error('[SocialMedia] Error loading profile image');
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
          console.error('[SocialMedia] Upload failed:', error);
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