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
          this.loading = false;
          
          // Use the profile user's template if available, otherwise use default
          if (user.profileTemplateType) {
            this.currentTemplate = user.profileTemplateType;
            if (this.isOwnProfile) {
              this.profileTemplateService.initFromAccount(user.profileTemplateType);
            }
          }
        },
        error: (error: string) => {
          this.alertService.error('Error loading profile: ' + error);
          this.loading = false;
        }
      });
  }

  changeTemplate(template: ProfileTemplateType) {
    if (!this.isOwnProfile) return;
    
    this.loading = true;
    this.profileTemplateService.setTemplate(template)
      .pipe(first())
      .subscribe({
        next: () => {
          this.currentTemplate = template;
          this.profileUser.profileTemplateType = template;
          this.loading = false;
          this.isEditingTemplate = false;
          this.alertService.success('Profile template updated successfully');
        },
        error: (error: string) => {
          this.alertService.error('Error updating template: ' + error);
          this.loading = false;
        }
      });
  }

  toggleTemplateEditor() {
    this.isEditingTemplate = !this.isEditingTemplate;
  }
} 