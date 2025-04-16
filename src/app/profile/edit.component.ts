import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { MustMatch } from '@app/_helpers';
import { environment } from '@environments/environment';

@Component({
    templateUrl: 'edit.component.html',
    styleUrls: ['edit.component.css']
})
export class EditComponent implements OnInit {
    account: any;
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

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) {
        this.account = this.accountService.accountValue;
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            title: [this.account?.title, Validators.required],
            firstName: [this.account?.firstName, Validators.required],
            lastName: [this.account?.lastName, Validators.required],
            email: [this.account?.email, [Validators.required, Validators.email]],
            password: ['', [Validators.minLength(6)]],
            confirmPassword: ['']
        }, {
            validator: MustMatch('password', 'confirmPassword')
        });
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

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.submitting = true;

        // Only include password if it was entered
        const formData = {...this.form.value};
        if (!formData.password) {
            delete formData.password;
            delete formData.confirmPassword;
        }

        if (this.account && this.account.id) {
            this.accountService.update(this.account.id, formData)
                .pipe(first())
                .subscribe({
                    next: () => {
                        this.alertService.success('Profile updated successfully');
                        this.submitting = false;
                        // Refresh the form with new values
                        this.account = this.accountService.accountValue;
                        this.form.patchValue({
                            title: this.account?.title,
                            firstName: this.account?.firstName,
                            lastName: this.account?.lastName,
                            email: this.account?.email
                        });
                        this.submitted = false;
                    },
                    error: error => {
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