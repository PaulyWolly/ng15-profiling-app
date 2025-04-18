import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MustMatch } from '../../../_helpers/must-match.validator';
import { PROFILE_TEMPLATES, ProfileTemplate, ProfileTemplateType } from '@app/_models/profile-template';
import { environment } from '@environments/environment';

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
  
  constructor(private formBuilder: FormBuilder) { }

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
  
  private updateDataFromInput(): void {
    if (this.initialData) {
      console.log('EditContentComponent - Initial data received:', this.initialData);
      this.patchFormValues();
      
      // Set the image URL from profile data
      this.imageUrl = this.initialData.profileImage || null;
      console.log('EditContentComponent - Image URL set to:', this.imageUrl);
      
      this.isAdmin = this.initialData.role === 'Admin';
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
      title: ['', Validators.required],
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
}
