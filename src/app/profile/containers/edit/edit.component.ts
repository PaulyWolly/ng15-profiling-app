import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
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
export class EditComponent implements OnInit, OnDestroy {
  account: Account | null = null;
  loading = false;
  submitted = false;
  submitting = false;
  editMode = EditMode.PROFILE;
  private bodyOriginalStyle: { [key: string]: string } = {};
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private alertService: AlertService,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    // Disable page scrolling
    this.disablePageScrolling();
    
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
  
  ngOnDestroy() {
    // Restore page scrolling
    this.restorePageScrolling();
  }
  
  // Completely disable page scrolling
  private disablePageScrolling() {
    const body = document.body;
    this.bodyOriginalStyle = {
      overflow: body.style.overflow,
      position: body.style.position,
      height: body.style.height,
      width: body.style.width
    };

    this.renderer.setStyle(body, 'overflow', 'hidden');
    this.renderer.setStyle(body, 'position', 'fixed');
    this.renderer.setStyle(body, 'width', '100%');
    this.renderer.setStyle(body, 'height', '100%');
    
    // Add CSS class to body for additional styling
    this.renderer.addClass(body, 'edit-profile-page');

    // Add a global event listeners for wheel and keyboard events
    document.addEventListener('wheel', this.preventScroll, { passive: false });
    document.addEventListener('keydown', this.preventArrowScroll, { passive: false });
  }

  // Restore original page scrolling
  private restorePageScrolling() {
    const body = document.body;
    
    for (const [prop, value] of Object.entries(this.bodyOriginalStyle)) {
      if (value) {
        this.renderer.setStyle(body, prop, value);
      } else {
        this.renderer.removeStyle(body, prop);
      }
    }
    
    // Remove the CSS class
    this.renderer.removeClass(body, 'edit-profile-page');

    // Remove the global event listeners
    document.removeEventListener('wheel', this.preventScroll);
    document.removeEventListener('keydown', this.preventArrowScroll);
  }

  // Global wheel event handler
  private preventScroll = (event: WheelEvent) => {
    // Only allow wheel events in scrollable form containers
    if (!this.isEventInScrollableArea(event.target as HTMLElement)) {
      event.preventDefault();
      return false;
    }
    return true;
  }
  
  // Global keyboard event handler to prevent arrow key scrolling
  private preventArrowScroll = (event: KeyboardEvent) => {
    // Arrow keys and space
    const scrollKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' ', 'PageUp', 'PageDown', 'Home', 'End'];
    
    if (scrollKeys.includes(event.key) && !this.isInputElement(event.target as HTMLElement)) {
      // Prevent arrow keys from scrolling the page
      // But allow if focus is in a form control (input, textarea, select)
      event.preventDefault();
      return false;
    }
    return true;
  }
  
  // Helper method to check if element is a form control
  private isInputElement(element: HTMLElement | null): boolean {
    if (!element) return false;
    
    const formElements = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'];
    
    // First check if element is directly a form element
    if (formElements.includes(element.tagName)) {
      return true;
    }
    
    // Then check if it's in a scrollable container
    if (this.isEventInScrollableArea(element)) {
      return true;
    }
    
    return false;
  }

  // Helper method to check if event is in a scrollable area
  private isEventInScrollableArea(element: HTMLElement | null): boolean {
    if (!element) return false;
    
    // Check if element or any parent has the class 'scrollable-form-container'
    while (element && element !== document.body) {
      if (element.classList && element.classList.contains('scrollable-form-container')) {
        return true;
      }
      element = element.parentElement;
    }
    return false;
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