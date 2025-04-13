import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { MustMatch } from '@app/_helpers';

@Component({
    templateUrl: './add-edit.component.html',
    styleUrls: ['./add-edit.component.css']
})
export class AddEditComponent implements OnInit {
    form!: FormGroup;
    id?: string;
    isAddMode!: boolean;
    loading = false;
    submitted = false;
    defaultImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2UwZTBlMCIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MyLjY3IDAgNC44NCAyLjE3IDQuODQgNC44NCAwIDIuNjctMi4xNyA0Ljg0LTQuODQgNC44NC0yLjY3IDAtNC44NC0yLjE3LTQuODQtNC44NCAwLTIuNjcgMi4xNy00Ljg0IDQuODQtNC44NHptMCAxMmE5LjkxIDkuOTEgMCAwIDEtNy45Mi00YzEuMDctMS4yNSAyLjYzLTIgNC4zMi0yczMuMjUuNzUgNC4zMiAyYTkuOTEgOS45MSAwIDAgMS03LjkyIDR6Ii8+PC9zdmc+';
    previewUrl?: string;
    uploadProgress = 0;
    selectedFile?: File;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;
        
        this.form = this.formBuilder.group({
            title: [''],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            role: ['', Validators.required],
            password: ['', [
                ...(!this.isAddMode ? [] : [Validators.required]),
                Validators.minLength(6)
            ]],
            confirmPassword: ['']
        }, {
            validator: MustMatch('password', 'confirmPassword')
        });

        if (!this.isAddMode) {
            this.accountService.getById(this.id!)
                .pipe(first())
                .subscribe(x => {
                    this.form.patchValue(x);
                    this.previewUrl = x.profileImage || this.defaultImage;
                });
        } else {
            this.previewUrl = this.defaultImage;
        }
    }

    clearSelectedImage() {
        this.selectedFile = undefined;
        this.previewUrl = this.defaultImage;
        this.uploadProgress = 0;
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            // Check file type
            if (!file.type.startsWith('image/')) {
                this.alertService.error('Please select an image file');
                return;
            }

            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                this.alertService.error('Image size should not exceed 5MB');
                return;
            }

            this.selectedFile = file;
            
            // Create a preview
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.previewUrl = e.target.result;
            };
            reader.readAsDataURL(file);

            // Upload the image immediately if we have an ID (edit mode)
            if (this.id) {
                this.uploadProgress = 0;
                this.accountService.uploadProfileImage(this.id, file)
                    .subscribe({
                        next: (response: any) => {
                            this.alertService.success('Profile image uploaded successfully');
                            this.uploadProgress = 100;
                            // Update the form with the new image path
                            this.form.patchValue({ profileImage: response.imagePath });
                        },
                        error: error => {
                            this.alertService.error('Error uploading image: ' + error);
                            this.uploadProgress = 0;
                        }
                    });
            }
        }
    }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;

        if (this.isAddMode) {
            this.createAccount();
        } else {
            this.updateAccount();
        }
    }

    private createAccount() {
        const formData = {
            ...this.form.value,
            profileImage: this.previewUrl
        };
        this.accountService.create(formData)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Account created successfully');
                    this.router.navigate(['/admin/accounts']);
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    private updateAccount() {
        const formData = {
            ...this.form.value,
            profileImage: this.previewUrl
        };
        this.accountService.update(this.id!, formData)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Update successful');
                    this.router.navigate(['/admin/accounts']);
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
}
