import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { MustMatch } from '@app/_helpers';
import { Account } from '@app/_models';

@Component({  
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  form!: FormGroup;
  submitting = false;
  submitted = false;
  deleting = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  id!: string;
  isAddMode!: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) { }

  get account(): Account {
    return this.accountService.accountValue!;
  }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.isAddMode = !this.id;
    
    // password not required in edit mode
    const passwordValidators = [Validators.minLength(6)];
    if (this.isAddMode) {
      passwordValidators.push(Validators.required);
    }

    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      password: ['', passwordValidators],
      confirmPassword: ['']
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });

    // Patch values from account if in edit mode
    if (!this.isAddMode && this.account) {
      this.form.patchValue({
        firstName: this.account.firstName,
        lastName: this.account.lastName,
        email: this.account.email,
        role: this.account.role
      });
    }
  }

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
    if (!this.selectedFile || !this.account?.id) return;

    const formData = new FormData();
    formData.append('profileImage', this.selectedFile);
    formData.append('userEmail', this.account.email || '');

    this.accountService.uploadImage(this.account.id, formData)
      .subscribe({
        next: () => {
          this.alertService.success('Image uploaded successfully');
          this.selectedFile = null;
          this.previewUrl = null;
        },
        error: (error) => {
          this.alertService.error('Image upload failed');
          console.error('Upload failed:', error);
        }
      });
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.submitting = true;
    this.accountService.update(this.account.id!, this.form.value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Update successful', { keepAfterRouteChange: true });
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: error => {
          this.alertService.error(error);
          this.submitting = false;
        }
      });
  }

  onDelete() {
    if (confirm('Are you sure?')) {
      this.deleting = true;
      this.accountService.delete(this.account.id!)
        .pipe(first())
        .subscribe(() => {
          this.alertService.success('Account deleted successfully', { keepAfterRouteChange: true });
        });
    }
  }
} 