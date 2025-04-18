import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService } from '../../_services/account.service';
import { AlertService } from '../../_services/alert.service';
import { MustMatch } from '../../_helpers/must-match.validator';
import { Account } from '../../_models/account';
import { environment } from '../../../environments/environment';
import { PROFILE_TEMPLATES, ProfileTemplate, ProfileTemplateType } from '@app/_models/profile-template';
import { EditMode } from '@app/shared/components/edit-content/edit-content.component';

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
    imageUrl: string | null = null;
    editMode = EditMode.ACCOUNT;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;
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
            confirmPassword: ['']
        }, {
            validator: MustMatch('password', 'confirmPassword')
        });

        if (!this.isAddMode && this.id) {
            this.loading = true;
            this.accountService.getById(this.id)
                .pipe(first())
                .subscribe({
                    next: (account) => {
                        console.log('Account data received:', account);
                        this.account = {...account}; // Create a copy of the account
                        
                        // Format profile image URL if needed
                        if (account.profileImage) {
                            if (!account.profileImage.startsWith('http') && !account.profileImage.startsWith('data:')) {
                                this.account.profileImage = `${environment.apiUrl}/${account.profileImage}`;
                            }
                            console.log('Formatted image URL:', this.account.profileImage);
                        }
                        
                        this.imageUrl = this.account.profileImage || null;
                        this.form.patchValue(this.account);
                        this.loading = false;
                    },
                    error: error => {
                        this.alertService.error(error);
                        this.loading = false;
                    }
                });
        }
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onImageChange(event: any) {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.match(/image\/*/) || !file.type.match(/\/(jpg|jpeg|png|gif)$/)) {
                this.alertService.error('Please select a valid image file (jpg, jpeg, png, or gif)');
                return;
            }
            
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                this.alertService.error('File size must be less than 5MB');
                return;
            }
            
            this.selectedFile = file;
            
            // Show preview immediately
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.previewUrl = e.target.result;
                this.imageUrl = e.target.result; // Update imageUrl for immediate display
                
                // Update the account object so it passes to the edit-content component
                if (this.account) {
                    this.account.profileImage = e.target.result;
                }
            };
            reader.readAsDataURL(file);
            
            // Upload immediately if we have an ID (edit mode)
            if (this.id) {
                this.uploadImage();
            }
        }
    }

    onImageRemove() {
        this.selectedFile = null;
        this.previewUrl = null;
        this.imageUrl = null;
        
        // Update the account object so it passes to the edit-content component
        if (this.account) {
            this.account.profileImage = null;
        }
        
        this.alertService.info('Image removed. Save to apply changes.');
    }

    async uploadImage() {
        if (!this.selectedFile || !this.id) {
            this.alertService.error('Please select a file to upload');
            return;
        }

        if (!this.account?.email) {
            this.alertService.error('Account email is required for upload');
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
            this.imageUrl = this.account.profileImage;
            console.log('Image updated after upload:', this.account.profileImage);
        }
        this.alertService.success('Image uploaded successfully');
    }

    onSave(formData: any) {
        this.submitted = true;
        
        // reset alerts on submit
        this.alertService.clear();
        
        this.submitting = true;
        this.saveAccount(formData)
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

    onCancel() {
        this.router.navigate(['../'], { relativeTo: this.route });
    }

    private saveAccount(formData: any) {
        // Pass only the account-specific fields to the API
        const accountData = {
            title: formData.title,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            role: formData.role,
            password: formData.password
        };
        
        return this.isAddMode
            ? this.accountService.create(accountData)
            : this.accountService.update(this.id!, accountData);
    }

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

    selectedTemplateChanged() {
        // You can add template-specific logic here
        console.log('Template changed to:', this.form.get('profileTemplateType')?.value);
    }
}
