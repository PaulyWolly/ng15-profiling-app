import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { AccountService, AlertService } from '@app/_services';
import { MustMatch } from '@app/_helpers';
import { environment } from '@environments/environment';
import { Account } from '@app/_models';
import { PROFILE_TEMPLATES, ProfileTemplate, ProfileTemplateType } from '@app/_models/profile-template';

interface FollowerImage {
  id: string;
  imageUrl: string;
  file?: File;
}

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
  @ViewChild('followerFileInput') followerFileInput!: ElementRef;
  
  account: Account | null = null;
  form!: FormGroup;
  loading = false;
  submitted = false;
  submitting = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploading = false;
  error = '';
  pendingFormData: FormData | null = null;
  imageConflict = false;
  imageConflictMessage = '';
  
  // Template related properties
  profileTemplates: ProfileTemplate[] = PROFILE_TEMPLATES;
  
  // Accordion state
  collapseContactInfo = true;
  collapseProfessionalInfo = true;
  collapseBioInfo = true;
  collapseSocialLinks = true;
  collapseSocialStats = true;
  collapseFollowerImages = true;
  
  // Follower images related
  isDraggingOver = false;
  followerImages: FollowerImage[] = [];
  followerUploadProgress = 0;
  followerUploadError = '';
  maxFollowerImages = 10;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) {
    this.account = this.accountService.accountValue;
  }

  ngOnInit() {
    // Initialize form with all possible fields
    this.form = this.formBuilder.group({
      title: [this.account?.title, Validators.required],
      firstName: [this.account?.firstName, Validators.required],
      lastName: [this.account?.lastName, Validators.required],
      email: [this.account?.email, [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: [''],
      
      // Template selection
      profileTemplateType: [this.account?.profileTemplateType || ProfileTemplateType.STANDARD],
      
      // Contact information
      phone: [this.account?.phone || ''],
      mobile: [this.account?.mobile || ''],
      address: [this.account?.address || ''],
      
      // Professional information
      position: [this.account?.position || ''],
      company: [this.account?.company || ''],
      skills: [this.account?.skills ? this.account.skills.join(', ') : ''],
      
      // Bio information
      bio: [this.account?.bio || ''],
      
      // Social media links
      website: [this.account?.website || ''],
      github: [this.account?.github || ''],
      twitter: [this.account?.twitter || ''],
      instagram: [this.account?.instagram || ''],
      facebook: [this.account?.facebook || ''],
      
      // Social media stats
      followersCount: [this.account?.followersCount || 0],
      followingCount: [this.account?.followingCount || 0]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
    
    // Auto-expand sections based on template type
    this.updateAccordionState();
    
    // Listen to template type changes to update accordion state
    this.form.get('profileTemplateType')?.valueChanges.subscribe(value => {
      this.updateAccordionState();
    });
    
    // Load any existing follower images if available
    this.loadFollowerImages();
  }
  
  // Load existing follower images from user account
  private loadFollowerImages() {
    // This would typically fetch images from the backend
    // For now, we'll mock some data if the account has social media template
    if (this.account?.profileTemplateType === ProfileTemplateType.SOCIAL_MEDIA) {
      // Placeholder for demo purposes - in reality these would come from your API
      const demoImages = this.account.followerImages || [];
      
      if (demoImages.length > 0) {
        this.followerImages = demoImages.map(img => ({
          id: img.id || this.generateUniqueId(),
          imageUrl: img.imageUrl || `${environment.apiUrl}/${img.path}`
        }));
      }
    }
  }
  
  // Updates accordion collapse state based on the selected template
  private updateAccordionState() {
    const templateType = this.form.get('profileTemplateType')?.value;
    
    switch(templateType) {
      case ProfileTemplateType.STANDARD:
        this.collapseContactInfo = false;
        this.collapseProfessionalInfo = true;
        this.collapseBioInfo = false;
        this.collapseSocialLinks = true;
        this.collapseSocialStats = true;
        this.collapseFollowerImages = true;
        break;
      case ProfileTemplateType.BUSINESS_CARD:
        this.collapseContactInfo = false;
        this.collapseProfessionalInfo = false;
        this.collapseBioInfo = true;
        this.collapseSocialLinks = true;
        this.collapseSocialStats = true;
        this.collapseFollowerImages = true;
        break;
      case ProfileTemplateType.SOCIAL_MEDIA:
        this.collapseContactInfo = true;
        this.collapseProfessionalInfo = true;
        this.collapseBioInfo = false;
        this.collapseSocialLinks = false;
        this.collapseSocialStats = false;
        this.collapseFollowerImages = false;
        break;
      default:
        // Default to all collapsed
        this.collapseContactInfo = true;
        this.collapseProfessionalInfo = true;
        this.collapseBioInfo = true;
        this.collapseSocialLinks = true; 
        this.collapseSocialStats = true;
        this.collapseFollowerImages = true;
    }
  }
  
  // Template type check methods
  isStandardTemplate(): boolean {
    return this.form.get('profileTemplateType')?.value === ProfileTemplateType.STANDARD;
  }
  
  isBusinessCardTemplate(): boolean {
    return this.form.get('profileTemplateType')?.value === ProfileTemplateType.BUSINESS_CARD;
  }
  
  isSocialMediaTemplate(): boolean {
    return this.form.get('profileTemplateType')?.value === ProfileTemplateType.SOCIAL_MEDIA;
  }
  
  // Accordion toggle methods
  toggleContactInfo() {
    this.collapseContactInfo = !this.collapseContactInfo;
  }
  
  toggleProfessionalInfo() {
    this.collapseProfessionalInfo = !this.collapseProfessionalInfo;
  }
  
  toggleBioInfo() {
    this.collapseBioInfo = !this.collapseBioInfo;
  }
  
  toggleSocialLinks() {
    this.collapseSocialLinks = !this.collapseSocialLinks;
  }
  
  toggleSocialStats() {
    this.collapseSocialStats = !this.collapseSocialStats;
  }
  
  toggleFollowerImages() {
    this.collapseFollowerImages = !this.collapseFollowerImages;
  }
  
  getSelectedTemplateDescription(): string {
    const templateType = this.form.get('profileTemplateType')?.value;
    const template = this.profileTemplates.find(t => t.id === templateType);
    return template?.description || 'No description available';
  }
  
  // Form controls convenience getter
  get f() { return this.form.controls; }

  // Profile image handling
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
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadImage() {
    if (!this.selectedFile || !this.account?.id) {
      this.error = 'Please select a file to upload';
      return;
    }

    if (!this.account?.email) {
      this.error = 'Account email is required for upload';
      return;
    }

    this.uploading = true;
    this.error = '';
    this.imageConflict = false;
    this.imageConflictMessage = '';

    const formData = new FormData();
    formData.append('profileImage', this.selectedFile);
    formData.append('userId', this.account.id);
    formData.append('userEmail', this.account.email);
    this.pendingFormData = formData;

    try {
      const response = await this.accountService.uploadImage(this.account.id, formData)
        .pipe(first())
        .toPromise();

      if (response.exists) {
        this.imageConflict = true;
        this.imageConflictMessage = response.message;
        this.uploading = false;
      } else {
        this.handleUploadSuccess(response);
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      if (error.exists) {
        this.imageConflict = true;
        this.imageConflictMessage = error.message || 'An image already exists for this profile';
        this.uploading = false;
      } else {
        this.error = error.message || 'Failed to upload image';
        this.uploading = false;
        this.alertService.error(this.error);
      }
    }
  }

  async confirmOverwrite() {
    if (!this.pendingFormData || !this.account?.id) return;

    this.uploading = true;
    this.pendingFormData.append('confirmed', 'true');

    try {
      const response = await this.accountService.uploadImage(this.account.id, this.pendingFormData)
        .pipe(first())
        .toPromise();
      
      this.handleUploadSuccess(response);
    } catch (error: any) {
      console.error('Overwrite failed:', error);
      this.error = error.message || 'Failed to overwrite image';
      this.uploading = false;
      this.alertService.error(this.error);
    }
  }

  cancelOverwrite() {
    this.imageConflict = false;
    this.imageConflictMessage = '';
    this.pendingFormData = null;
    this.selectedFile = null;
    this.previewUrl = null;
  }

  private handleUploadSuccess(response: any) {
    if (response.imagePath && this.account) {
      this.account.profileImage = `${environment.apiUrl}/${response.imagePath}`;
      this.alertService.success('Profile image uploaded successfully');
    } else {
      this.error = 'Invalid response from server';
    }
    this.uploading = false;
    this.selectedFile = null;
    this.previewUrl = null;
    this.imageConflict = false;
    this.imageConflictMessage = '';
    this.pendingFormData = null;
  }
  
  // Follower Image Management Methods
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = true;
  }
  
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;
  }
  
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;
    
    if (event.dataTransfer?.files) {
      this.handleFollowerImageFiles(event.dataTransfer.files);
    }
  }
  
  onFollowerImageSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.handleFollowerImageFiles(event.target.files);
    }
  }
  
  handleFollowerImageFiles(fileList: FileList) {
    const files = Array.from(fileList);
    
    // Validate max images
    if (this.followerImages.length + files.length > this.maxFollowerImages) {
      this.followerUploadError = `You can only upload a maximum of ${this.maxFollowerImages} follower images`;
      return;
    }
    
    // Reset error message
    this.followerUploadError = '';
    this.followerUploadProgress = 0;
    
    // Validate and process each file
    let validFiles = files.filter(file => {
      // Check file type
      if (!file.type.match(/image\/*/) || !file.type.match(/\/(jpg|jpeg|png|gif)$/)) {
        this.followerUploadError = 'Only JPG, PNG and GIF images are allowed';
        return false;
      }
      // Check file size (2MB max for each follower image)
      if (file.size > 2 * 1024 * 1024) {
        this.followerUploadError = 'Images must be less than 2MB each';
        return false;
      }
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Start uploading the valid files
    this.uploadFollowerImages(validFiles);
  }
  
  private async uploadFollowerImages(files: File[]) {
    // In a real application, you'd upload these to your server using your AccountService
    // Here we'll simulate it by creating image previews
    
    this.followerUploadProgress = 10;
    const totalFiles = files.length;
    const loadedFiles: FollowerImage[] = [];
    let filesProcessed = 0;
    
    // Process each file one by one
    for (const file of files) {
      try {
        const imageUrl = await this.readFileAsDataURL(file);
        
        // Create a new follower image entry
        const newFollower: FollowerImage = {
          id: this.generateUniqueId(),
          imageUrl: imageUrl,
          file: file // Store the file for possible backend upload later
        };
        
        loadedFiles.push(newFollower);
        filesProcessed++;
        this.followerUploadProgress = Math.min(90, Math.floor((filesProcessed / totalFiles) * 90));
      } catch (err) {
        console.error('Error processing image:', err);
      }
    }
    
    // Add the processed files to our follower images array
    this.followerImages = [...this.followerImages, ...loadedFiles];
    
    // Simulate server processing time
    setTimeout(() => {
      this.followerUploadProgress = 100;
      
      // Reset progress bar after a delay
      setTimeout(() => {
        this.followerUploadProgress = 0;
      }, 1000);
    }, 500);
    
    // Clear the file input so the same files can be selected again if needed
    if (this.followerFileInput) {
      this.followerFileInput.nativeElement.value = '';
    }
  }
  
  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = (e) => {
        reject(e.target?.error || new Error('Unknown error reading file'));
      };
      reader.readAsDataURL(file);
    });
  }
  
  removeFollowerImage(img: FollowerImage) {
    this.followerImages = this.followerImages.filter(image => image.id !== img.id);
  }
  
  onFollowerDrop(event: CdkDragDrop<FollowerImage[]>) {
    // Reorder the follower images when drag and dropped
    moveItemInArray(this.followerImages, event.previousIndex, event.currentIndex);
    // Force update to trigger change detection
    this.followerImages = [...this.followerImages];
  }
  
  private generateUniqueId(): string {
    // Helper to generate a random ID for new follower images
    return 'follower_' + Math.random().toString(36).substr(2, 9);
  }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.submitting = true;

    // Process form data before submission
    const formData = {...this.form.value};
    
    // Only include password if it was entered
    if (!formData.password) {
      delete formData.password;
      delete formData.confirmPassword;
    }
    
    // Convert skills from comma-separated string to array
    if (formData.skills && typeof formData.skills === 'string') {
      formData.skills = formData.skills
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s);
    }
    
    // Add follower images data for social media template
    if (this.isSocialMediaTemplate() && this.followerImages.length > 0) {
      // In a real application, you would upload the files to your server first
      // Here we'll just include the existing image URLs
      formData.followerImages = this.followerImages.map(img => ({
        id: img.id,
        imageUrl: img.imageUrl
      }));
    }

    console.log('Submitting profile update with data:', formData);

    if (this.account && this.account.id) {
      this.accountService.update(this.account.id, formData)
        .pipe(first())
        .subscribe({
          next: (updatedAccount) => {
            console.log('Profile updated successfully:', updatedAccount);
            this.alertService.success('Profile updated successfully');
            this.submitting = false;
            // Redirect to profile page
            this.router.navigate(['/profile']);
          },
          error: error => {
            console.error('Error updating profile:', error);
            this.alertService.error(error);
            this.submitting = false;
          }
        });
    } else {
      this.alertService.error('Account not found');
      this.submitting = false;
    }
  }

  cancelEdit() {
    this.router.navigate(['/profile']);
  }
} 