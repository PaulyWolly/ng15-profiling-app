import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { PROFILE_TEMPLATES, ProfileTemplate, ProfileTemplateType } from '../_models/profile-template';
import { AccountService } from './account.service';

const baseUrl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: 'root' })
export class ProfileTemplateService {
    private currentTemplateSubject: BehaviorSubject<ProfileTemplateType>;
    public currentTemplate: Observable<ProfileTemplateType>;

    constructor(
        private http: HttpClient,
        private accountService: AccountService
    ) {
        // Default to standard template if none is set
        const savedTemplate = localStorage.getItem('profileTemplate') as ProfileTemplateType || ProfileTemplateType.STANDARD;
        console.log('ProfileTemplateService - Initializing with template:', savedTemplate);
        this.currentTemplateSubject = new BehaviorSubject<ProfileTemplateType>(savedTemplate);
        this.currentTemplate = this.currentTemplateSubject.asObservable();
    }

    public get currentTemplateValue(): ProfileTemplateType {
        return this.currentTemplateSubject.value;
    }

    public getTemplates(): ProfileTemplate[] {
        return PROFILE_TEMPLATES;
    }

    public getTemplateById(id: ProfileTemplateType): ProfileTemplate | undefined {
        return PROFILE_TEMPLATES.find(template => template.id === id);
    }

    public setTemplate(templateType: ProfileTemplateType): void {
        console.log('ProfileTemplateService - Setting template to:', templateType);
        // Immediately update locally
        localStorage.setItem('profileTemplate', templateType);
        this.currentTemplateSubject.next(templateType);
        
        if (!this.accountService.accountValue) {
            console.log('ProfileTemplateService - No user account, only updated locally');
            return;
        }

        // If logged in, update in database in background (don't wait for response)
        console.log('ProfileTemplateService - Updating template in database');
        this.http.put(`${baseUrl}/${this.accountService.accountValue.id}/profile-template`, { templateType })
            .pipe(
                catchError(error => {
                    console.error('Error updating template in database:', error);
                    return of(null);
                })
            )
            .subscribe(() => {
                console.log('ProfileTemplateService - Template updated in database');
            });
    }

    // Initialize template from user account
    public initFromAccount(templateType: ProfileTemplateType): void {
        console.log('ProfileTemplateService - Initializing from account with template:', templateType);
        localStorage.setItem('profileTemplate', templateType);
        this.currentTemplateSubject.next(templateType);
    }
} 