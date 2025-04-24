import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountService, ProfileTemplateService, AlertService } from '@app/_services';
import { Account } from '@app/_models';
import { ProfileTemplateType, ProfileTemplate } from '@app/_models/profile-template';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  // Make enum accessible in template
  ProfileTemplateType = ProfileTemplateType;
  
  account: Account | null;
  profileUser!: Account;
  loading = false;
  isOwnProfile = false;
  templates: ProfileTemplate[];
  currentTemplate: ProfileTemplateType;
  isEditingTemplate = false;

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private profileTemplateService: ProfileTemplateService,
    private alertService: AlertService
  ) {
    this.account = this.accountService.accountValue;
    this.templates = this.profileTemplateService.getTemplates();
    this.currentTemplate = this.profileTemplateService.currentTemplateValue;
    console.log('[ProfileComponent] Initial currentTemplate:', this.currentTemplate);
    console.log('[ProfileComponent] ProfileTemplateType values:', ProfileTemplateType);
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  private loadUserProfile() {
    this.loading = true;
    const userId = this.route.snapshot.params['id'] || this.account?.id;
    
    // If viewing own profile
    this.isOwnProfile = userId === this.account?.id;
    
    this.accountService.getById(userId)
      .pipe(first())
      .subscribe({
        next: (user) => {
          this.profileUser = user;
          
          // Use the profile user's template if available, otherwise use default
          if (user.profileTemplateType) {
            console.log('[ProfileComponent] User profile template type:', user.profileTemplateType);
            this.currentTemplate = user.profileTemplateType;
            if (this.isOwnProfile) {
              this.profileTemplateService.initFromAccount(user.profileTemplateType);
            }
          } else {
            console.log('[ProfileComponent] No template type in user profile, using default');
          }
          
          console.log('[ProfileComponent] Current template after loading user profile:', this.currentTemplate);
          this.loading = false;
        },
        error: (error: string) => {
          this.alertService.error('Error loading profile: ' + error);
          this.loading = false;
        }
      });
  }

  changeTemplate(template: ProfileTemplateType) {
    if (!this.isOwnProfile) return;
    
    console.log('[ProfileComponent] Changing template to:', template);
    console.log('[ProfileComponent] Template type:', typeof template);
    console.log('[ProfileComponent] Current template before update:', this.currentTemplate);
    
    this.loading = true;
    this.alertService.clear();
    
    // Update profile first with selected template
    if (this.account?.id) {
      // Preserve existing profile data when updating template
      const updateData = {
        profileTemplateType: template,
        profileImage: this.profileUser.profileImage, // Preserve profile image
        followerImages: this.profileUser.followerImages // Preserve follower images
      };
      
      this.accountService.update(this.account.id, updateData)
        .pipe(first())
        .subscribe({
          next: (response) => {
            console.log('[ProfileComponent] Template updated in database:', response);
            console.log('[ProfileComponent] Response profileTemplateType:', response.profileTemplateType);
            
            // Update local cache and service (skip database update since we just did it)
            this.currentTemplate = template;
            this.profileUser.profileTemplateType = template;
            this.profileTemplateService.setTemplate(template, true);
            
            console.log('[ProfileComponent] Current template after update:', this.currentTemplate);
            
            this.loading = false;
            this.isEditingTemplate = false;
            this.alertService.success('Profile template updated successfully');
          },
          error: (error) => {
            console.error('[ProfileComponent] Error updating template:', error);
            this.loading = false;
            this.alertService.error('Failed to update template: ' + error);
          }
        });
    } else {
      // Fallback if user ID is missing
      this.currentTemplate = template;
      this.profileTemplateService.setTemplate(template);
      this.loading = false;
      this.isEditingTemplate = false;
    }
  }

  toggleTemplateEditor() {
    this.isEditingTemplate = !this.isEditingTemplate;
  }
} 