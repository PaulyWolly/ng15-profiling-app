import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { MustMatch } from '@app/_helpers';
import { Account } from '@app/_models';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})
export class UpdateComponent implements OnInit {
  form!: FormGroup;
  submitting = false;
  submitted = false;
  deleting = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

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
    this.form = this.formBuilder.group({
      title: [this.account.title, Validators.required],
      firstName: [this.account.firstName, Validators.required],
      lastName: [this.account.lastName, Validators.required],
      email: [this.account.email, [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
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