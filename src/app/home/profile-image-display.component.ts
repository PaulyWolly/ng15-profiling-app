import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountService } from '@app/_services';
import { Role } from '@app/_models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-image-display',
  templateUrl: './profile-image-display.component.html',
  styleUrls: ['./profile-image-display.component.css']
})
export class ProfileImageDisplayComponent implements OnInit, OnDestroy {
  imageUrl: string | null = null;
  userId: string | null = null;
  isAdmin = false;
  loading = true;
  private accountSubscription?: Subscription;

  constructor(private accountService: AccountService) { }

  ngOnInit() {
    // First try to get the current value
    this.updateFromAccount(this.accountService.accountValue);
    
    // Then subscribe to changes to keep it updated
    this.accountSubscription = this.accountService.account.subscribe(account => {
      console.log('[ProfileImageDisplay] Account updated:', account?.id);
      this.updateFromAccount(account);
    });
  }
  
  ngOnDestroy() {
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
  }
  
  private updateFromAccount(account: any) {
    if (account?.id) {
      this.userId = account.id;
      this.isAdmin = account.role === Role.Admin;
      
      // If profile image URL changed, update and show loading state
      if (account.profileImage !== this.imageUrl) {
        this.loading = true;
        this.imageUrl = account.profileImage;
        
        // If no image URL is provided, don't show a loading state
        if (!this.imageUrl) {
          this.loading = false;
        }
      }
    } else {
      this.userId = null;
      this.isAdmin = false;
      this.imageUrl = null;
      this.loading = false;
    }
  }
  
  onImageLoaded() {
    console.log('[ProfileImageDisplay] Image loaded successfully');
    this.loading = false;
  }
  
  onImageError() {
    console.error('[ProfileImageDisplay] Error loading image');
    this.imageUrl = null;
    this.loading = false;
  }
} 