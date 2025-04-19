import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Account, FollowerImage } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class UploadService {
    constructor(private http: HttpClient) { }

    uploadProfileImage(file: File, existingFormData?: FormData) {
        const formData = existingFormData || new FormData();
        if (!existingFormData) {
            formData.append('profileImage', file);
        }

        return this.http.post<Account>(`${environment.apiUrl}/accounts/upload-profile-image`, formData);
    }
    
    uploadFollowerImage(file: File, followerName: string, followerTitle?: string) {
        const formData = new FormData();
        formData.append('followerImage', file);
        formData.append('followerName', followerName);
        
        if (followerTitle) {
            formData.append('followerTitle', followerTitle);
        }

        return this.http.post<FollowerImage>(`${environment.apiUrl}/accounts/upload-follower-image`, formData);
    }
} 