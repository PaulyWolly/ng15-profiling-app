import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

    public setTemplate(templateType: ProfileTemplateType): Observable<any> {
        if (!this.accountService.accountValue) {
            // If not logged in, just update locally
            localStorage.setItem('profileTemplate', templateType);
            this.currentTemplateSubject.next(templateType);
            return new Observable(observer => {
                observer.next();
                observer.complete();
            });
        }

        // If logged in, update in database
        return this.http.put(`${baseUrl}/${this.accountService.accountValue.id}/profile-template`, { templateType })
            .pipe(map(() => {
                localStorage.setItem('profileTemplate', templateType);
                this.currentTemplateSubject.next(templateType);
            }));
    }

    // Initialize template from user account
    public initFromAccount(templateType: ProfileTemplateType): void {
        localStorage.setItem('profileTemplate', templateType);
        this.currentTemplateSubject.next(templateType);
    }
} 