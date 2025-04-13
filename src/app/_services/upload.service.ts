import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Account } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class UploadService {
    constructor(private http: HttpClient) { }

    uploadProfileImage(file: File) {
        const formData = new FormData();
        formData.append('profileImage', file);

        return this.http.post<Account>(`${environment.apiUrl}/accounts/upload-profile-image`, formData);
    }
} 