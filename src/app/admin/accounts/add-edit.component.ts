import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService } from '../../_services/account.service';
import { AlertService } from '../../_services/alert.service';
import { MustMatch } from '../../_helpers/must-match.validator';
import { Account } from '../../_models/account';
import { environment } from '../../../environments/environment';
import { PROFILE_TEMPLATES, ProfileTemplate, ProfileTemplateType } from '@app/_models/profile-template';

@Component({
    templateUrl: './add-edit.component.html',
    styleUrls: ['./add-edit.component.css']
})
export class AddEditComponent implements OnInit {
    title!: string;
    id?: string;
    form!: FormGroup;
    loading = false;
    submitting = false;
    submitted = false;
    account: any = null;
    selectedFile: File | null = null;
    previewUrl: string | null = null;
    uploading = false;
    error = '';
    isAddMode = true;
    imageConflict = false;
    imageConflictMessage = '';
    pendingFormData: FormData | null = null;
    profileTemplates: ProfileTemplate[] = PROFILE_TEMPLATES;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.params['id'];
        this.id = id;
        this.isAddMode = !id;
        this.title = this.isAddMode ? 'Create Account' : 'Edit Account';

        // password not required in edit mode
        const passwordValidators = [Validators.minLength(6)];
        if (this.isAddMode) {
            passwordValidators.push(Validators.required);
        }

        this.form = this.formBuilder.group({
            title: ['', Validators.required],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            role: ['', Validators.required],
            password: ['', passwordValidators],
            confirmPassword: [''],
            
            // Profile template selection
            profileTemplateType: [ProfileTemplateType.STANDARD],
            
            // Personal & Professional Details
            position: [''],
            company: [''],
            address: [''],
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

        if (typeof id === 'string') {
            this.accountService.getById(id)
                .pipe(first())
                .subscribe(account => {
                    this.account = account;
                    // Only show profile image if it's the current user's account
                    const currentUser = this.accountService.accountValue;
                    if (currentUser?.id === account.id || currentUser?.role === 'Admin') {
                        // Ensure the profile image URL is complete
                        if (account.profileImage && !account.profileImage.startsWith('http')) {
                            account.profileImage = `${environment.apiUrl}/${account.profileImage}`;
                        }
                    } else {
                        account.profileImage = undefined;
                    }
                    
                    // Convert skills array to comma-separated string for form if it exists
                    if (account.skills && Array.isArray(account.skills)) {
                        const skillsString = account.skills.join(', ');
                        this.form.get('skills')?.setValue(skillsString);
                    }
                    
                    // Initialize template type if not set
                    if (!account.profileTemplateType) {
                        account.profileTemplateType = ProfileTemplateType.STANDARD;
                    }
                    
                    this.form.patchValue(account);
                });
        }
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

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
        if (!this.selectedFile || !this.id) {
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
        formData.append('userId', this.id);
        formData.append('userEmail', this.account.email);
        this.pendingFormData = formData;

        try {
            const response = await this.accountService.uploadImage(this.id, formData)
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
        if (!this.pendingFormData || !this.id) return;
        
        this.uploading = true;
        // Add overwrite flag to form data
        this.pendingFormData.append('overwrite', 'true');
        
        try {
            const response = await this.accountService.uploadImage(this.id, this.pendingFormData)
                .pipe(first())
                .toPromise();
            this.handleUploadSuccess(response);
        } catch (error: any) {
            this.error = error.message || 'Failed to upload image';
            this.uploading = false;
            this.alertService.error(this.error);
        }
    }

    cancelOverwrite() {
        this.imageConflict = false;
        this.imageConflictMessage = '';
        this.pendingFormData = null;
        this.error = '';
    }

    private handleUploadSuccess(response: any) {
        this.uploading = false;
        this.imageConflict = false;
        this.selectedFile = null;
        if (response.profileImage) {
            this.account.profileImage = response.profileImage.startsWith('http') 
                ? response.profileImage 
                : `${environment.apiUrl}/${response.profileImage}`;
        }
        this.alertService.success('Image uploaded successfully');
    }

    cancelEdit() {
        this.router.navigate(['../'], { relativeTo: this.route });
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
        this.saveAccount()
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Account saved', { keepAfterRouteChange: true });
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.submitting = false;
                }
            });
    }

    private saveAccount() {
        // create or update account based on isAddMode flag
        const formData = this.form.value;
        
        // Convert skills string to array if provided
        if (formData.skills) {
            // Ensure skills is a string before splitting
            if (typeof formData.skills === 'string') {
                formData.skills = formData.skills.split(',').map((skill: string) => skill.trim());
            } else if (Array.isArray(formData.skills)) {
                // Already an array, make sure all items are trimmed
                formData.skills = formData.skills.map((skill: string) => skill.trim());
            } else {
                // Set to empty array if not a string or array
                formData.skills = [];
            }
        } else {
            // Ensure skills is always an array
            formData.skills = [];
        }
        
        return this.isAddMode
            ? this.accountService.create(formData)
            : this.accountService.update(this.id!, formData);
    }

    isSocialMediaTemplate(): boolean {
        return this.form.get('profileTemplateType')?.value === ProfileTemplateType.SOCIAL_MEDIA;
    }

    isBusinessCardTemplate(): boolean {
        return this.form.get('profileTemplateType')?.value === ProfileTemplateType.BUSINESS_CARD;
    }

    getSelectedTemplateDescription(): string {
        const selectedType = this.form.get('profileTemplateType')?.value;
        const template = this.profileTemplates.find(t => t.id === selectedType);
        return template?.description || 'No description available';
    }
}
