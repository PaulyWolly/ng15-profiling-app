import { Component, OnInit, OnDestroy, Renderer2, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { Account } from '@app/_models';
import { EditMode } from '@app/shared/components/edit-content/edit-content.component';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('editContainer') editContainer!: ElementRef;
  
  account: Account | null = null;
  loading = false;
  submitted = false;
  submitting = false;
  editMode = EditMode.PROFILE;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private alertService: AlertService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef
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
            console.log('[EditComponent] Received account details from getById:', account);
            this.account = account;
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            this.alertService.error(error);
            this.loading = false;
          }
        });
    } else {
      this.loading = false;
    }

    // Add a class to the body to control overflow through CSS
    document.body.classList.add('editing-profile');
  }

  ngAfterViewInit() {
    // No special setup needed
  }
  
  ngOnDestroy() {
    // Restore page scrolling by removing the class
    document.body.classList.remove('editing-profile');
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
            this.navigateToProfile();
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
    this.navigateToProfile();
  }
  
  // Helper method to navigate back to the profile page
  private navigateToProfile() {
    // Navigate back to profile page
    this.router.navigate(['/profile']);
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