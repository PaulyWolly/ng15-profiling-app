import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MustMatch } from '../../../_helpers/must-match.validator';
import { PROFILE_TEMPLATES, ProfileTemplate, ProfileTemplateType } from '@app/_models/profile-template';
import { environment } from '@environments/environment';
import { FormsModule } from '@angular/forms';
import { FollowerImage } from '@app/_models/account';
import { UploadService } from '@app/_services/upload.service';
import { AlertService } from '@app/_services/alert.service';
import { AccountService } from '@app/_services/account.service';
import { Account, AccountUpdate } from '@app/_models/account';
import { first } from 'rxjs/operators';
import { Role } from '@app/_models';
import { Router, ActivatedRoute } from '@angular/router';

// Extending FollowerImage for local use
export interface Follower extends FollowerImage {
  imageFile?: File;
}

export enum EditMode {
  PROFILE = 'profile',
  ACCOUNT = 'account'
}

interface AccountFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  password?: string;
  confirmPassword?: string;
}

interface EditContentState {
  id?: string;
  title: string;
  loading: boolean;
  submitting: boolean;
  submitted: boolean;
  isCurrentUserAdmin: boolean;
}

@Component({
  selector: 'app-edit-content',
  templateUrl: './edit-content.component.html',
  styleUrls: ['./edit-content.component.css']
})
export class EditContentComponent implements OnInit, OnChanges, EditContentState {
  @Input() editMode: EditMode = EditMode.PROFILE;
  @Input() isAddMode: boolean = false;
  @Input() initialData: any = null;
  @Input() submitting: boolean = false;
  @Input() loading: boolean = false;
  @Input() submitted: boolean = false;
  @Input() accountId: string | null = null;
  
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  @Output() imageChange = new EventEmitter<any>();
  @Output() imageRemove = new EventEmitter<void>();
  
  form!: FormGroup;
  profileTemplates: ProfileTemplate[] = PROFILE_TEMPLATES;
  imageUrl: string | null = null;
  isCurrentUserAdmin: boolean = false;
  Role = Role; // Expose Role enum to template
  
  // Follower management
  followers: Follower[] = [];
  showFollowerDialog: boolean = false;
  currentFollower: Follower = { name: '' };
  editingFollowerIndex: number = -1;
  
  // Image upload properties
  imageConflict: boolean = false;
  imageConflictMessage: string = '';
  error: string = '';
  selectedFile: File | null = null;
  pendingFormData: FormData | null = null;
  
  id?: string;
  title: string = '';
  
  constructor(
    private formBuilder: FormBuilder,
    private uploadService: UploadService,
    private alertService: AlertService,
    public accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.isAddMode = !this.id;
    
    // Check if current user is admin
    this.isCurrentUserAdmin = this.accountService.isAdmin;
    console.log('Current user admin status:', this.isCurrentUserAdmin);

    this.initializeForm();
    this.title = this.isAddMode ? 'Add User' : 'Edit User';

    if (!this.isAddMode && this.id) {
      this.loading = true;
      this.accountService.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (account: Account) => {
            this.patchFormValues(account);
            this.loading = false;
          },
          error: error => {
            this.alertService.error(error);
            this.loading = false;
          }
        });
    }
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
      
      // Set the image URL from profile data
      if (this.initialData.profileImage) {
        this.imageUrl = this.initialData.profileImage;
      } else {
        this.imageUrl = null;
      }
      console.log('EditContentComponent - Image URL set to:', this.imageUrl);
      
      // Load existing followers if available
      if (this.initialData.followerImages && Array.isArray(this.initialData.followerImages)) {
        this.followers = [...this.initialData.followerImages];
      }
    }
  }
  
  private initializeForm() {
    const roleControl = {
      value: Role.User,
      disabled: !this.isCurrentUserAdmin
    };

    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: [roleControl.value, { disabled: roleControl.disabled }],
      password: ['', [Validators.minLength(6), ...(!this.isAddMode ? [] : [Validators.required])]],
      confirmPassword: [''],
      
      // Profile template type
      profileTemplateType: [ProfileTemplateType.STANDARD],
      
      // Contact Information
      address: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      phone: [''],
      mobile: [''],
      
      // Professional Information
      position: [''],
      company: [''],
      bio: [''],
      skills: [{ value: '', disabled: true }], // Initially disabled, enabled for Business Card template
      
      // Social Media Information
      website: [''],
      twitter: [''],
      facebook: [''],
      instagram: [''],
      github: [''],
      followersCount: [{ value: 0, disabled: true }], // Initially disabled, enabled for Social Media template
      followingCount: [{ value: 0, disabled: true }]  // Initially disabled, enabled for Social Media template
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });

    // Initialize form based on template type
    this.onTemplateChange();

    console.log('Form initialized with role control disabled:', !this.isCurrentUserAdmin);
  }
  
  private patchFormValues(account?: Account) {
    if (!account) {
        console.warn('No account data provided for patch');
        return;
    }
    
    console.log('Patching form values with account:', account);
    const formValues: AccountUpdate = {
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        role: account.role as Role  // Explicitly cast to Role
    };
    console.log('Setting role value:', formValues.role, 'Disabled:', !this.isCurrentUserAdmin);
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
    this.submitted = true;
    this.alertService.clear();

    // Mark all fields as touched to trigger validation
    Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
    });

    if (this.form.invalid) {
        // Log the specific validation errors
        console.log('Form validation errors:', {
            formValue: this.form.value,
            formErrors: Object.keys(this.form.controls).reduce((acc, key) => {
                const control = this.form.get(key);
                if (control?.errors) {
                    acc[key] = control.errors;
                }
                return acc;
            }, {} as any)
        });
        return;
    }

    this.submitting = true;
    this.saveAccount()
        .pipe(first())
        .subscribe({
            next: () => {
                this.alertService.success('Account saved', { keepAfterRouteChange: true });
                this.router.navigateByUrl('/admin/accounts');
            },
            error: (error: Error) => {
                this.alertService.error(error.message);
                this.submitting = false;
            }
        });
  }
  
  onCancel() {
    this.cancel.emit();
  }
  
  onImageChange(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Check if this is the same image
      if (this.initialData?.profileImage) {
        this.imageConflict = true;
        this.imageConflictMessage = 'There is already an image for this account, do you want to overwrite it?';
        this.selectedFile = file;
        return;
      }
      
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
  
  confirmOverwrite() {
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result as string;
        this.imageChange.emit({
          file: this.selectedFile,
          dataUrl: e.target.result,
          confirmed: true
        });
      };
      reader.readAsDataURL(this.selectedFile);
      this.imageConflict = false;
      this.imageConflictMessage = '';
      this.selectedFile = null;
    }
  }

  cancelOverwrite() {
    this.imageConflict = false;
    this.imageConflictMessage = '';
    this.selectedFile = null;
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
  
  onImageRemove() {
    this.imageUrl = null;
    this.imageRemove.emit();
  }
  
  onTemplateChange() {
    const templateType = this.form.get('profileTemplateType')?.value;
    console.log('Template changed to:', templateType);
    
    // Update form validation and UI based on template type
    if (this.isSocialMediaTemplate()) {
      // Enable social media specific fields
      this.form.get('followersCount')?.enable();
      this.form.get('followingCount')?.enable();
      this.form.get('skills')?.disable();
      
      // Social media fields are required
      this.form.get('twitter')?.setValidators([Validators.required]);
      this.form.get('instagram')?.setValidators([Validators.required]);
      
      // Show follower section
      console.log('Enabling social media features');
    } else if (this.isBusinessCardTemplate()) {
      // Enable business card specific fields
      this.form.get('followersCount')?.disable();
      this.form.get('followingCount')?.disable();
      this.form.get('skills')?.enable();
      
      // Business fields are required
      this.form.get('position')?.setValidators([Validators.required]);
      this.form.get('company')?.setValidators([Validators.required]);
      this.form.get('skills')?.setValidators([Validators.required]);
      
      // Remove social media requirements
      this.form.get('twitter')?.clearValidators();
      this.form.get('instagram')?.clearValidators();
      
      console.log('Enabling business card features');
    } else {
      // Standard template - disable special features
      this.form.get('followersCount')?.disable();
      this.form.get('followingCount')?.disable();
      this.form.get('skills')?.disable();
      
      // Clear special requirements
      this.form.get('position')?.clearValidators();
      this.form.get('company')?.clearValidators();
      this.form.get('skills')?.clearValidators();
      this.form.get('twitter')?.clearValidators();
      this.form.get('instagram')?.clearValidators();
      
      console.log('Using standard template features');
    }
    
    // Update all validators
    ['position', 'company', 'skills', 'twitter', 'instagram'].forEach(field => {
      this.form.get(field)?.updateValueAndValidity();
    });
    
    // Force change detection
    this.form.updateValueAndValidity();
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

  // Handle role changes
  onRoleChange(event: any) {
    if (!this.isCurrentUserAdmin) {
        console.log('[DEBUG] Non-admin tried to change role - reverting');
        const roleControl = this.form.get('role');
        if (roleControl) {
            roleControl.setValue(this.initialData?.role || Role.User, { emitEvent: false });
        }
        return;
    }

    const newRole = event.target.value;
    console.log('[DEBUG] Role change by admin:', {
        newRole,
        oldRole: this.initialData?.role,
        formValue: this.form.get('role')?.value
    });
  }

  // Add this getter to filter role options based on user permissions
  get availableRoles(): Role[] {
    if (this.isCurrentUserAdmin) {
      return [Role.Admin, Role.User];
    }
    return [Role.User];
  }

  private saveAccount() {
    const formData = this.form.getRawValue() as AccountUpdate;
    
    // If user is not admin, preserve the original role
    if (!this.isCurrentUserAdmin) {
      delete formData.role;
    }

    // Clean up the form data by removing empty strings
    const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== '') {
            acc[key as keyof AccountUpdate] = value;
        }
        return acc;
    }, {} as AccountUpdate);

    console.log('Saving account with data:', cleanedData);

    return this.id
        ? this.accountService.update(this.id, cleanedData)
        : this.accountService.create(cleanedData);
  }
}
