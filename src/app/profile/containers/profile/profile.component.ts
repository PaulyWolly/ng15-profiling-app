import { Component, OnInit } from '@angular/core';
import { Account } from '@app/_models';
import { AccountService } from '@app/_services';

export enum ProfileTemplateType {
  STANDARD = 'STANDARD',
  BUSINESS_CARD = 'BUSINESS_CARD',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA'
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  account: Account | null = null;
  profileUser: Account | null = null;
  currentTemplate = ProfileTemplateType.STANDARD;
  ProfileTemplateType = ProfileTemplateType;
  loading = false;
  isOwnProfile = true;
  isEditingTemplate = false;

  constructor(private accountService: AccountService) {}

  ngOnInit() {
    this.loading = true;
    this.accountService.account.subscribe(account => {
      this.account = account;
      this.profileUser = account;
      this.loading = false;
    });
  }

  isTemplateActive(template: string): boolean {
    return this.currentTemplate === template;
  }

  selectTemplate(template: string) {
    this.currentTemplate = template as ProfileTemplateType;
  }

  toggleTemplateEditor() {
    this.isEditingTemplate = !this.isEditingTemplate;
  }
} 