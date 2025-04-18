import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { Account } from '@app/_models';
import { EditMode } from '@app/shared/components/edit-content/edit-content.component';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
  account: Account | null = null;
  loading = false;
  submitted = false;
  submitting = false;
  editMode = EditMode.PROFILE;
  
  constructor(
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    // Load account data
    this.loading = true;
    this.account = this.accountService.accountValue;
    
    if (this.account && this.account.id) {
      this.accountService.getById(this.account.id)
        .pipe(first())
        .subscribe({
          next: (account) => {
            this.account = account;
            this.loading = false;
          },
          error: (error) => {
            this.alertService.error(error);
            this.loading = false;
          }
        });
    } else {
      this.loading = false;
    }
  }
  
  onSave(formData: any) {
    this.submitted = true;
    
    // reset alerts on submit
    this.alertService.clear();
    
    this.submitting = true;
    
    if (this.account && this.account.id) {
      // Process the form data for saving
      this.accountService.update(this.account.id, formData)
        .pipe(first())
        .subscribe({
          next: () => {
            this.alertService.success('Profile updated', { keepAfterRouteChange: true });
            this.router.navigate(['../'], { relativeTo: this.router.routerState.root.firstChild });
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
    this.router.navigate(['../'], { relativeTo: this.router.routerState.root.firstChild });
  }
  
  onImageChange(event: any) {
    // Process image change
    if (this.account) {
      this.account.profileImage = event.dataUrl;
    }
  }
  
  onImageRemove() {
    // Remove the image
    if (this.account) {
      this.account.profileImage = undefined;
    }
  }
} 