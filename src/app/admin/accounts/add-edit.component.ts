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
    title!: string;
    loading = false;
    submitting = false;
    submitted = false;
    account: any = null;
    selectedFile: File | null = null;
    previewUrl: string | null = null;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        
        this.form = this.formBuilder.group({
            title: ['', Validators.required],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            role: ['', Validators.required],
            password: ['', [
                ...(!this.id ? [Validators.required] : []),
                Validators.minLength(6)
            ]],
            confirmPassword: ['']
        }, {
            validator: MustMatch('password', 'confirmPassword')
        });

        this.title = 'Create Account';
        if (this.id) {
            // edit mode
            this.title = 'Edit Account';
            this.loading = true;
            this.accountService.getById(this.id)
                .pipe(first())
                .subscribe(x => {
                    this.form.patchValue(x);
                    this.account = x;
                    this.loading = false;
                });
        }
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0];
        if (this.selectedFile) {
            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.previewUrl = e.target.result;
            };
            reader.readAsDataURL(this.selectedFile);
        }
    }

    uploadImage() {
        if (!this.selectedFile || !this.id) return;

        this.accountService.uploadImage(this.id, this.selectedFile)
            .subscribe({
                next: (account) => {
                    this.alertService.success('Image uploaded successfully');
                    this.account = account;
                    this.selectedFile = null;
                    this.previewUrl = null;
                },
                error: (error) => {
                    this.alertService.error('Image upload failed');
                    console.error('Upload failed:', error);
                }
            });
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

        // create or update account based on id param
        let observable = this.id
            ? this.accountService.update(this.id, this.form.value)
            : this.accountService.create(this.form.value);

        observable.pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Account saved', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.submitting = false;
                }
            });
    }
}
