import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize, catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { environment } from '@environments/environment';
import { Account } from '../_models/account';

const baseUrl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: 'root' })
export class AccountService {
    private accountSubject: BehaviorSubject<Account | null>;
    public account: Observable<Account | null>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.accountSubject = new BehaviorSubject<Account | null>(null);
        this.account = this.accountSubject.asObservable();
    }

    public get accountValue() {
        return this.accountSubject.value;
    }

    // Authentication endpoints
    login(email: string, password: string) {
        return this.http.post<any>(`${baseUrl}/authenticate`, { email, password }, { withCredentials: true })
            .pipe(map(account => {
                console.log('[AccountService] Login Response:', account);
                if (account.profileImage) {
                    account.profileImage = `${environment.apiUrl}/${account.profileImage}`;
                }
                this.accountSubject.next(account);
                this.startRefreshTokenTimer();
                return account;
            }));
    }

    logout() {
        this.http.post<any>(`${baseUrl}/revoke-token`, {}, { withCredentials: true })
            .pipe(
                finalize(() => {
                    this.stopRefreshTokenTimer();
                    this.accountSubject.next(null);
                    this.router.navigate(['/account/login']);
                })
            )
            .subscribe();
    }

    refreshToken() {
        return this.http.post<any>(`${baseUrl}/refresh-token`, {}, { withCredentials: true })
            .pipe(
                map((account) => {
                    console.log('[AccountService] Refresh Response:', account);
                    if (account.profileImage) {
                        account.profileImage = `${environment.apiUrl}/${account.profileImage}`;
                    }
                    this.accountSubject.next(account);
                    this.startRefreshTokenTimer();
                    return account;
                }),
                catchError((err) => {
                    console.log('RefreshToken failed, calling logout()');
                    this.logout();
                    return throwError(() => err);
                })
            );
    }

    // Account management endpoints
    register(account: Account) {
        return this.http.post(`${baseUrl}/register`, account);
    }

    verifyEmail(token: string) {
        return this.http.post(`${baseUrl}/verify-email`, { token });
    }

    forgotPassword(email: string) {
        return this.http.post(`${baseUrl}/forgot-password`, { email });
    }

    validateResetToken(token: string) {
        return this.http.post(`${baseUrl}/validate-reset-token`, { token });
    }

    resetPassword(token: string, password: string, confirmPassword: string) {
        return this.http.post(`${baseUrl}/reset-password`, { token, password, confirmPassword });
    }

    // CRUD operations
    getAll() {
        return this.http.get<Account[]>(baseUrl);
    }

    getById(id: string) {
        return this.http.get<Account>(`${baseUrl}/${id}`)
            .pipe(map(account => {
                const currentUser = this.accountValue;
                
                if (account.profileImage) {
                    // Only show profile image if it's the current user's account or if the current user is an Admin
                    if (currentUser?.id === account.id || currentUser?.role === 'Admin') {
                        if (!account.profileImage.startsWith('http')) {
                            account.profileImage = `${environment.apiUrl}/${account.profileImage}`;
                        }
                    } else {
                        // Hide profile image for non-admin users viewing other profiles
                        account.profileImage = undefined;
                    }
                }
                return account;
            }));
    }

    create(params: any) {
        return this.http.post(baseUrl, params);
    }

    update(id: string, params: any) {
        return this.http.put(`${baseUrl}/${id}`, params)
            .pipe(map((account: any) => {
                if (account.profileImage) {
                    account.profileImage = `${environment.apiUrl}/${account.profileImage}`;
                }
                if (account.id === this.accountValue?.id) {
                    account = { ...this.accountValue, ...account };
                    this.accountSubject.next(account);
                }
                return account;
            }));
    }

    delete(id: string) {
        return this.http.delete(`${baseUrl}/${id}`)
            .pipe(finalize(() => {
                if (id === this.accountValue?.id)
                    this.logout();
            }));
    }

    // Profile image handling
    uploadImage(id: string, formData: FormData) {
        const currentUser = this.accountValue;
        
        if (!currentUser || (currentUser.id !== id && currentUser.role !== 'Admin')) {
            return throwError(() => new Error('Unauthorized: You can only upload images to your own profile unless you are an admin'));
        }

        return this.http.post<any>(`${baseUrl}/upload-profile-image`, formData, { withCredentials: true })
            .pipe(
                map(response => {
                    if (response.imagePath) {
                        response.profileImage = `${environment.apiUrl}/${response.imagePath}`;
                        
                        // Only update the current user's profile image if we're uploading to their account
                        if (currentUser && currentUser.id === id) {
                            const updatedAccount = { ...currentUser, profileImage: response.profileImage };
                            this.accountSubject.next(updatedAccount);
                        }
                    }
                    return response;
                }),
                catchError(error => {
                    console.log('[AccountService] Upload Error:', error);

                    // Handle 409 Conflict from the interceptor
                    if (error.status === 409) {
                        return throwError(() => ({
                            exists: true,
                            message: error.error?.message || 'An image already exists for this profile'
                        }));
                    }

                    // Handle other errors
                    return throwError(() => new Error(error.error?.message || 'Failed to upload image'));
                })
            );
    }

    // Timer methods
    private refreshTokenTimeout?: any;

    private startRefreshTokenTimer() {
        const jwtBase64 = this.accountValue!.jwtToken!.split('.')[1];
        const jwtToken = JSON.parse(atob(jwtBase64));
        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (60 * 1000);
        this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }
}