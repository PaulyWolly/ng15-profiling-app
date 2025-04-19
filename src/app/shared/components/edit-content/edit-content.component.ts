import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MustMatch } from '../../../_helpers/must-match.validator';
import { PROFILE_TEMPLATES, ProfileTemplate, ProfileTemplateType } from '@app/_models/profile-template';
import { environment } from '@environments/environment';
import { FormsModule } from '@angular/forms';
import { FollowerImage } from '@app/_models/account';
import { UploadService } from '@app/_services/upload.service';
import { first } from 'rxjs/operators';

// Extending FollowerImage for local use
export interface Follower extends FollowerImage {
  imageFile?: File;
}

export enum EditMode {
  PROFILE = 'profile',
  ACCOUNT = 'account'
}

@Component({
  selector: 'app-edit-content',
  templateUrl: './edit-content.component.html',
  styleUrls: ['./edit-content.component.css']
})
export class EditContentComponent implements OnInit, OnChanges {
  @Input() editMode: EditMode = EditMode.PROFILE;
  @Input() isAddMode: boolean = false;
  @Input() initialData: any = null;
  @Input() submitting: boolean = false;
  @Input() loading: boolean = false;
  @Input() submitted: boolean = false;
  
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  @Output() imageChange = new EventEmitter<any>();
  @Output() imageRemove = new EventEmitter<void>();
  
  form!: FormGroup;
  profileTemplates: ProfileTemplate[] = PROFILE_TEMPLATES;
  imageUrl: string | null = null;
  isAdmin: boolean = false;
  
  // Follower management
  followers: Follower[] = [];
  showFollowerDialog: boolean = false;
  currentFollower: Follower = { name: '' };
  editingFollowerIndex: number = -1;
  
  constructor(
    private formBuilder: FormBuilder,
    private uploadService: UploadService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.updateDataFromInput();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    // If initialData changes and the component is already initialized
    if (changes.initialData && this.form) {
      this.updateDataFromInput();
    }
  }
  
  /**
   * Prevents wheel scrolling on the main container
   * This stops the page from scrolling up and covering the menu
   */
  preventWheelScroll(event: WheelEvent): void {
    if (this.editMode === EditMode.ACCOUNT) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  
  /**
   * Handles keyboard events within the scrollable form container
   * This enables proper keyboard navigation within the form
   */
  handleKeyboardEvents(event: KeyboardEvent): void {
    // Allow all keyboard events within the scrollable container
    // The event will propagate but be caught by our global handler
    // if it's a navigation key that would cause page scrolling
    event.stopPropagation();
  }
  
  /**
   * Allows wheel scrolling within the scrollable form container
   * This enables scrolling of form content while preventing the page scroll
   */
  allowWheelScroll(event: WheelEvent): void {
    // Don't stop propagation, but let the event bubble naturally
    // This allows scrolling within the container
    event.stopPropagation();
  }
  
  private updateDataFromInput(): void {
    if (this.initialData) {
      console.log('EditContentComponent - Initial data received:', this.initialData);
      this.patchFormValues();
      
      // Set the image URL from profile data
      this.imageUrl = this.initialData.profileImage || null;
      console.log('EditContentComponent - Image URL set to:', this.imageUrl);
      
      this.isAdmin = this.initialData.role === 'Admin';
      
      // Load existing followers if available
      if (this.initialData.followerImages && Array.isArray(this.initialData.followerImages)) {
        this.followers = [...this.initialData.followerImages];
      }
    }
  }
  
  private initializeForm() {
    // password not required in edit mode
    const passwordValidators = [Validators.minLength(6)];
    if (this.isAddMode) {
      passwordValidators.push(Validators.required);
    }

    this.form = this.formBuilder.group({
      // Common fields
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', passwordValidators],
      confirmPassword: [''],
      
      // Admin-specific fields (hidden in profile mode)
      role: ['User', this.editMode === EditMode.ACCOUNT ? Validators.required : null],
      
      // Profile template selection
      profileTemplateType: [ProfileTemplateType.STANDARD],
      
      // Personal & Professional Details
      position: [''],
      company: [''],
      address: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      phone: [''],
      mobile: [''],
      bio: [''],
      
      // Social Media Links
      website: [''],
      github: [''],
      twitter: [''],
      instagram: [''],
      facebook: [''],
      
      // Social Media Stats
      followersCount: [0],
      followingCount: [0],
      
      // Professional Skills (stored as comma-separated string in form)
      skills: ['']
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
  }
  
  private patchFormValues() {
    // Only patch the fields that exist in the initialData
    const formValues: any = {};
    
    Object.keys(this.form.controls).forEach(key => {
      if (this.initialData.hasOwnProperty(key)) {
        // Handle special cases like skills which might be an array in the data
        if (key === 'skills' && Array.isArray(this.initialData.skills)) {
          formValues[key] = this.initialData.skills.join(', ');
        } else {
          formValues[key] = this.initialData[key];
        }
      }
    });
    
    this.form.patchValue(formValues);
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }
  
  // Template type checkers
  isBusinessCardTemplate() {
    return this.form.get('profileTemplateType')?.value === ProfileTemplateType.BUSINESS_CARD;
  }

  isSocialMediaTemplate() {
    return this.form.get('profileTemplateType')?.value === ProfileTemplateType.SOCIAL_MEDIA;
  }

  isStandardTemplate() {
    return this.form.get('profileTemplateType')?.value === ProfileTemplateType.STANDARD;
  }
  
  getSelectedTemplateDescription() {
    const templateId = this.form.get('profileTemplateType')?.value;
    const template = this.profileTemplates.find(t => t.id === templateId);
    return template ? template.description : '';
  }
  
  // Event handlers
  onSubmit() {
    if (this.form.invalid) {
      return;
    }
    
    const formData = this.form.value;
    
    // Process skills if present
    if (formData.skills) {
      if (typeof formData.skills === 'string') {
        formData.skills = formData.skills.split(',').map((skill: string) => skill.trim());
      } else if (Array.isArray(formData.skills)) {
        formData.skills = formData.skills.map((skill: string) => skill.trim());
      } else {
        formData.skills = [];
      }
    } else {
      formData.skills = [];
    }
    
    // Add followers to the form data
    if (this.isSocialMediaTemplate()) {
      // Make sure we're only including necessary properties and properly formatted followers
      formData.followerImages = this.followers.map(follower => ({
        id: follower.id,
        name: follower.name,
        title: follower.title || '',
        imageUrl: follower.imageUrl || '',
        path: follower.path || ''
      }));
      
      console.log('Submitting followers:', formData.followerImages);
    }
    
    this.save.emit(formData);
  }
  
  onCancel() {
    this.cancel.emit();
  }
  
  onImageChange(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result as string;
        this.imageChange.emit({
          file: file,
          dataUrl: e.target.result
        });
      };
      
      reader.readAsDataURL(file);
    }
  }
  
  onImageRemove() {
    this.imageUrl = null;
    this.imageRemove.emit();
  }
  
  onTemplateChange() {
    // You can add template-specific logic here
    console.log('Template changed to:', this.form.get('profileTemplateType')?.value);
  }
  
  // Utility methods for template
  getPageTitle() {
    if (this.editMode === EditMode.PROFILE) {
      return 'Update Profile';
    } else {
      return this.isAddMode ? 'Create Account' : 'Edit Account';
    }
  }
  
  showField(fieldName: string): boolean {
    // Determine if a field should be shown based on edit mode and template
    switch (fieldName) {
      case 'role':
        return this.editMode === EditMode.ACCOUNT;
      case 'skills':
        return this.isBusinessCardTemplate();
      case 'followersCount':
      case 'followingCount':
        return this.isSocialMediaTemplate();
      default:
        return true;
    }
  }

  // Follower management methods
  hasFollowers(): boolean {
    return this.followers && this.followers.length > 0;
  }
  
  openFollowerDialog(): void {
    this.currentFollower = { name: '' };
    this.editingFollowerIndex = -1;
    this.showFollowerDialog = true;
  }
  
  closeFollowerDialog(): void {
    this.showFollowerDialog = false;
  }
  
  editFollower(index: number): void {
    if (index >= 0 && index < this.followers.length) {
      this.currentFollower = { ...this.followers[index] };
      this.editingFollowerIndex = index;
      this.showFollowerDialog = true;
    }
  }
  
  removeFollower(index: number): void {
    if (index >= 0 && index < this.followers.length) {
      this.followers.splice(index, 1);
    }
  }
  
  saveFollower(): void {
    if (!this.currentFollower.name) {
      alert('Follower name is required');
      return;
    }
    
    // If we have an image file, upload it first
    if (this.currentFollower.imageFile) {
      console.log('Uploading follower image for:', this.currentFollower.name);
      
      this.uploadService.uploadFollowerImage(
        this.currentFollower.imageFile, 
        this.currentFollower.name,
        this.currentFollower.title
      )
      .pipe(first())
      .subscribe({
        next: (follower) => {
          console.log('Follower image uploaded successfully:', follower);
          // Update with the server-provided data
          this.currentFollower.id = follower.id;
          this.currentFollower.imageUrl = follower.imageUrl;
          this.currentFollower.path = follower.path;
          
          this.saveFollowerToList();
        },
        error: (error) => {
          console.error('Failed to upload follower image', error);
          
          // Create a unique ID for the follower if we don't have one
          if (!this.currentFollower.id) {
            this.currentFollower.id = Date.now().toString();
          }
          
          // If we have a data URL from the file preview, use that as a temporary image
          // This allows us to display the image even if the server upload failed
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.currentFollower.imageUrl = e.target.result;
            
            // Save the follower with the local image
            this.saveFollowerToList();
            
            // Show a more helpful error message
            console.warn('Using local image preview as fallback since upload failed.');
            alert('Could not upload the follower image to the server, but the follower has been saved with a local image. The image may not persist after page refresh. Error: ' + (error.message || 'Unknown error'));
          };
          
          reader.readAsDataURL(this.currentFollower.imageFile as File);
        }
      });
    } else {
      // Create a unique ID if we don't have one
      if (!this.currentFollower.id) {
        this.currentFollower.id = Date.now().toString();
      }
      
      // Save without image upload
      this.saveFollowerToList();
    }
  }
  
  // Helper method to save follower to the list
  private saveFollowerToList(): void {
    if (this.editingFollowerIndex >= 0) {
      // Update existing follower
      this.followers[this.editingFollowerIndex] = { ...this.currentFollower };
    } else {
      // Add new follower
      this.followers.push({ ...this.currentFollower });
    }
    
    this.closeFollowerDialog();
  }
  
  onFollowerImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentFollower.imageUrl = e.target.result;
        this.currentFollower.imageFile = file;
      };
      reader.readAsDataURL(file);
    }
  }
}
