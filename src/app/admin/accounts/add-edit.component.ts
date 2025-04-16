import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService } from '../../_services/account.service';
import { AlertService } from '../../_services/alert.service';
import { MustMatch } from '../../_helpers/must-match.validator';
import { Account } from '../../_models/account';
import { environment } from '../../../environments/environment';

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
    imagePosition = { x: 0, y: 0 };
    dragStart = { x: 0, y: 0 };
    imageScale = 1;
    isDragging = false;
    isAddMode = true;
    imageConflict = false;
    imageConflictMessage = '';
    pendingFormData: FormData | null = null;

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
            confirmPassword: ['']
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
                    this.form.patchValue(account);
                });
        }
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    startDragging(event: MouseEvent) {
        event.preventDefault();
        this.isDragging = true;
        const img = event.target as HTMLElement;
        const rect = img.getBoundingClientRect();
        
        this.dragStart = {
            x: event.clientX - (rect.left + rect.width / 2),
            y: event.clientY - (rect.top + rect.height / 2)
        };
    }

    onDrag(event: MouseEvent) {
        if (this.isDragging) {
            const container = event.currentTarget as HTMLElement;
            const rect = container.getBoundingClientRect();
            
            // Calculate new position within container bounds
            const x = event.clientX - this.dragStart.x - rect.left;
            const y = event.clientY - this.dragStart.y - rect.top;
            
            // Apply bounds to keep image visible
            const maxX = container.offsetWidth / 2;
            const maxY = container.offsetHeight / 2;
            
            this.imagePosition = {
                x: Math.max(-maxX, Math.min(maxX, x)),
                y: Math.max(-maxY, Math.min(maxY, y))
            };
        }
    }

    stopDragging() {
        this.isDragging = false;
    }

    adjustScale(delta: number) {
        this.imageScale = Math.max(1, Math.min(3, this.imageScale + delta));
    }

    resetPosition() {
        this.imagePosition = { x: 0, y: 0 };
        this.imageScale = 1;
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
        this.pendingFormData.append('confirmed', 'true');

        try {
            const response = await this.accountService.uploadImage(this.id, this.pendingFormData)
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
        if (response.imagePath) {
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

    // Cancel edit and return to accounts list
    cancelEdit() {
        this.router.navigate(['/admin/accounts']);
    }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            console.log('Form is invalid:', this.form.errors);
            return;
        }

        this.submitting = true;
        this.saveAccount()
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Account saved successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['/admin/accounts']);
                },
                error: error => {
                    this.alertService.error(error);
                    this.submitting = false;
                }
            });
    }

    private saveAccount() {
        // create or update account based on isAddMode flag
        return this.isAddMode
            ? this.accountService.create(this.form.value)
            : this.accountService.update(this.id!, this.form.value);
    }
}
