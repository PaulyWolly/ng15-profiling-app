import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ProfileTemplateService } from '@app/_services';
import { ProfileTemplateType } from '@app/_models/profile-template';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  currentUrl: string = '';

  constructor(
    private router: Router,
    private profileTemplateService: ProfileTemplateService
  ) {
    console.log('LayoutComponent constructor called');
    
    // Subscribe to router events to detect current route
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.currentUrl = event.url;
    });
  }

  ngOnInit() {
    console.log('LayoutComponent ngOnInit called');
    this.currentUrl = this.router.url;
    console.log('LayoutComponent - Current URL:', this.currentUrl);
    console.log('LayoutComponent - Current template:', this.profileTemplateService.currentTemplateValue);
  }
  
  // Check if we're on the main profile details page
  isDetailsRoute(): boolean {
    const result = this.currentUrl === '/profile' || this.currentUrl === '/profile/';
    console.log('isDetailsRoute check:', this.currentUrl, result);
    return result;
  }
  
  // Select template function that passes to the service
  selectTemplate(template: string): void {
    console.log('LayoutComponent - Selecting template:', template);
    
    // Convert string to ProfileTemplateType enum
    let templateType: ProfileTemplateType;
    
    switch(template) {
      case 'standard':
        templateType = ProfileTemplateType.STANDARD;
        break;
      case 'business-card':
        templateType = ProfileTemplateType.BUSINESS_CARD;
        break;
      case 'social-media':
        templateType = ProfileTemplateType.SOCIAL_MEDIA;
        break;
      default:
        templateType = ProfileTemplateType.STANDARD;
    }
    
    console.log('LayoutComponent - Setting template to:', templateType);
    
    // Debugging log to verify values
    console.log('ProfileTemplateType values:', ProfileTemplateType);
    console.log('Template string to enum mapping:', {
      'standard': ProfileTemplateType.STANDARD,
      'business-card': ProfileTemplateType.BUSINESS_CARD,
      'social-media': ProfileTemplateType.SOCIAL_MEDIA
    });
    
    this.profileTemplateService.setTemplate(templateType);
  }
} 