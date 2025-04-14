import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { AccountService } from '@app/_services';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-profile-image',
  template: `
    <div class="card">
      <div class="card-header">
        <h4>Profile Image</h4>
      </div>
      <div class="card-body">
        <div *ngIf="imageUrl" class="mb-3">
          <img [src]="imageUrl" class="profile-image" alt="Profile Image">
        </div>
        <div class="custom-file">
          <input type="file" 
                 class="custom-file-input" 
                 id="profileImage" 
                 (change)="onFileSelected($event)"
                 accept="image/*">
          <label class="custom-file-label" for="profileImage">
            {{selectedFile?.name || 'Choose file'}}
          </label>
        </div>
        <div class="mt-3" *ngIf="selectedFile">
          <button class="btn btn-primary" 
                  (click)="uploadImage()" 
                  [disabled]="uploading">
            {{uploading ? 'Uploading...' : 'Upload Image'}}
          </button>
        </div>
        <div *ngIf="error" class="alert alert-danger mt-3">
          {{error}}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-image {
      width: 200px;
      height: 280px;
      border-radius: 120px;
      object-fit: contain;
      border: 2px solid #e0e0e0;
      background-color: #f5f5f5;
    }
    .custom-file-input:lang(en)~.custom-file-label::after {
      content: "Browse";
    }
  `]
})
export class ProfileImageComponent implements OnInit {
  selectedFile: File | null = null;
  uploading = false;
  error = '';
  imageUrl: string | null = null;

  constructor(private accountService: AccountService) { }

  ngOnInit() {
    // Get current user's profile image if it exists
    const account = this.accountService.accountValue;
    if (account?.imagePath) {
      this.imageUrl = `${environment.apiUrl}/${account.imagePath}`;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/image\/*/) || !file.type.match(/\/(jpg|jpeg|png|gif)$/)) {
        this.error = 'Please select a valid image file (jpg, jpeg, png, or gif)';
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'File size must be less than 5MB';
        return;
      }
      this.selectedFile = file;
      this.error = '';
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadImage() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('profileImage', this.selectedFile);

    this.uploading = true;
    this.error = '';

    this.accountService.uploadImage(this.accountService.accountValue?.id!, formData)
      .pipe(first())
      .subscribe({
        next: (response: any) => {
          console.log('Upload successful:', response);
          if (response.imagePath) {
            this.imageUrl = `${environment.apiUrl}/${response.imagePath}`;
          }
          this.uploading = false;
          this.selectedFile = null;
        },
        error: error => {
          console.error('Upload failed:', error);
          this.error = error.message || 'Failed to upload image';
          this.uploading = false;
        }
      });
  }
} 