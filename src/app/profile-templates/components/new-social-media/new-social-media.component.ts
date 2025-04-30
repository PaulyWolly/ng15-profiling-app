import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { Account } from '@app/_models';
import { AccountService, AlertService } from '@app/_services';
import { first } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MapDialogComponent } from '../../../profile/components/map-dialog/map-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-new-social-media',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './new-social-media.component.html',
  styleUrls: ['./new-social-media.component.scss']
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
    private dialog: MatDialog,
    private http: HttpClient
  ) {}
  
  ngOnInit() {
    // If you want to fetch followers from the backend, do it here and set this.followers
    // Example:
    // this.http.get<{ imageUrl: string; titlePosition?: string; comment?: string }[]>(...)
    //   .subscribe(followers => this.followers = followers);

    this.imageLoading = !!this.profile?.profileImage;
  }

  get followers() {
    return this.profile?.followerImages || [];
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