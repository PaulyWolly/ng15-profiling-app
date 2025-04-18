import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize, catchError, switchMap, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { environment } from '@environments/environment';
import { Account } from '../_models/account';

const baseUrl = `${environment.apiUrl}/accounts`;
const REMEMBER_ME_KEY = 'rememberMe';
const JWT_TOKEN_KEY = 'jwt_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

@Injectable({ providedIn: 'root' })
export class AccountService {
    private accountSubject: BehaviorSubject<Account | null>;
    public account: Observable<Account | null>;
    private http!: HttpClient; // Using definite assignment assertion
    private initialized = false;

    constructor(
        private router: Router,
        private injector: Injector
    ) {
        this.accountSubject = new BehaviorSubject<Account | null>(null);
        this.account = this.accountSubject.asObservable();
        
        // Lazy initialize on first use to avoid circular dependency
        // Don't inject HttpClient directly in constructor
    }

    // Lazy getter for HttpClient to avoid circular dependency
    private getHttp(): HttpClient {
        if (!this.http) {
            this.http = this.injector.get(HttpClient);
        }
        return this.http;
    }

    // Initialize at app startup - call this from app component, not constructor
    public initialize() {
        if (this.initialized) return;
        
        // Try to restore remembered user session
        this.initializeFromStorage();
        this.initialized = true;
    }

    public get accountValue() {
        return this.accountSubject.value;
    }

    // Authentication endpoints
    login(email: string, password: string, rememberMe: boolean = false) {
        return this.getHttp().post<any>(`${baseUrl}/authenticate`, { email, password, rememberMe }, { withCredentials: true })
            .pipe(
                map(account => {
                    console.log('[AccountService] Login Response:', account);
                    
                    // Format profile image URL if needed
                    if (account.profileImage) {
                        account.profileImage = `${environment.apiUrl}/${account.profileImage}`;
                    }
                    
                    // Store auth data based on rememberMe preference
                    this.storeAuthData(account, rememberMe, email);
                    
                    // Update account subject and start refresh timer
                    this.accountSubject.next(account);
                    this.startRefreshTokenTimer();
                    
                    // Double-check localStorage to ensure data was stored - helps debug persistence issues
                    if (rememberMe) {
                        const storedRememberMe = localStorage.getItem(REMEMBER_ME_KEY);
                        const storedJwtToken = localStorage.getItem(JWT_TOKEN_KEY);
                        
                        console.log('[AccountService] Verified localStorage after login:', {
                            hasRememberMe: !!storedRememberMe,
                            hasJwtToken: !!storedJwtToken
                        });
                        
                        // If data wasn't saved properly, try one more time
                        if (!storedRememberMe || !storedJwtToken) {
                            console.warn('[AccountService] LocalStorage not updated properly, retrying');
                            this.storeAuthData(account, rememberMe, email);
                        }
                    }
                    
                    return account;
                })
            );
    }

    logout() {
        // Clear all stored auth data
        this.clearAuthData();
        
        // Revoke token on the server
        this.getHttp().post<any>(`${baseUrl}/revoke-token`, {}, { withCredentials: true })
            .pipe(
                finalize(() => {
                    this.stopRefreshTokenTimer();
                    this.accountSubject.next(null);
                    this.router.navigate(['/account/login']);
                })
            )
            .subscribe();
    }

    // Initialize app from stored auth data
    private initializeFromStorage() {
        try {
            // First check if we have a JWT token directly
            const jwtToken = localStorage.getItem(JWT_TOKEN_KEY) || sessionStorage.getItem(JWT_TOKEN_KEY);
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
            const rememberedData = localStorage.getItem(REMEMBER_ME_KEY);
            
            // Log current storage state for debugging
            console.log('[AccountService] Storage check:', { 
                hasJwtToken: !!jwtToken, 
                hasRefreshToken: !!refreshToken,
                hasRememberedData: !!rememberedData
            });
            
            // Try to auto-login only if we have some stored credentials
            if (jwtToken || rememberedData) {
                console.log('[AccountService] Attempting to restore session...');
                
                // If we have a JWT token but restoration fails, we should still
                // preserve the remembered data until explicit logout
                const originalRememberedData = rememberedData;
                
                // If we have a valid JWT token, use it directly to prevent refresh cycle
                if (jwtToken) {
                    try {
                        // Parse the JWT and check if it's still valid
                        const jwtBase64 = jwtToken.split('.')[1];
                        const jwtData = JSON.parse(atob(jwtBase64));
                        const expiration = new Date(jwtData.exp * 1000);
                        
                        // If token is still valid, create a user account directly
                        if (expiration > new Date()) {
                            console.log('[AccountService] JWT still valid, restoring without refresh');
                            const account = {
                                jwtToken: jwtToken,
                                refreshToken: refreshToken || jwtToken,
                                // Other props will be filled in after token refresh
                            };
                            this.accountSubject.next(account as any);
                            this.startRefreshTokenTimer();
                            
                            // Also do a refresh in background to update full account
                            this.refreshToken().subscribe();
                            return;
                        }
                    } catch (e) {
                        console.error('[AccountService] Error parsing JWT:', e);
                    }
                }
                
                this.refreshToken().subscribe({
                    next: (account) => {
                        console.log('[AccountService] Session restored successfully');
                    },
                    error: (err) => {
                        console.error('[AccountService] Failed to restore session:', err);
                        
                        // Don't clear remembered data on failed refresh - just clear tokens
                        // This allows retry on next load instead of completely wiping login data
                        if (originalRememberedData) {
                            console.log('[AccountService] Preserving remember me data for future attempts');
                            localStorage.removeItem(JWT_TOKEN_KEY);
                            localStorage.removeItem(REFRESH_TOKEN_KEY);
                            sessionStorage.removeItem(JWT_TOKEN_KEY);
                            sessionStorage.removeItem(REFRESH_TOKEN_KEY);
                            
                            // Put remembered data back
                            localStorage.setItem(REMEMBER_ME_KEY, originalRememberedData);
                        } else {
                            this.clearAuthData();
                        }
                    }
                });
            }
        } catch (error) {
            console.error('[AccountService] Error restoring session:', error);
            // Don't automatically clear on error - might be temporary issue
            // Only clear JWT tokens but keep remember me data
            localStorage.removeItem(JWT_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            sessionStorage.removeItem(JWT_TOKEN_KEY);
            sessionStorage.removeItem(REFRESH_TOKEN_KEY);
        }
    }

    // Store authentication data based on rememberMe preference
    private storeAuthData(account: any, rememberMe: boolean, email: string) {
        // Always clear previous data first
        this.clearAuthData();
        
        if (rememberMe) {
            // Store in localStorage for persistence across browser sessions
            localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify({
                remembered: true,
                userId: account.id,
                email: email,
                timestamp: new Date().getTime()
            }));
            
            // If API provides tokens directly, store them too
            if (account.jwtToken) {
                localStorage.setItem(JWT_TOKEN_KEY, account.jwtToken);
            }
            if (account.refreshToken) {
                localStorage.setItem(REFRESH_TOKEN_KEY, account.refreshToken);
            }
        } else {
            // For session-only storage, use sessionStorage
            if (account.jwtToken) {
                sessionStorage.setItem(JWT_TOKEN_KEY, account.jwtToken);
            }
            if (account.refreshToken) {
                sessionStorage.setItem(REFRESH_TOKEN_KEY, account.refreshToken);
            }
        }
    }
    
    // Clear all authentication data from storage
    private clearAuthData() {
        localStorage.removeItem(REMEMBER_ME_KEY);
        localStorage.removeItem(JWT_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        sessionStorage.removeItem(JWT_TOKEN_KEY);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    refreshToken() {
        // Create a more resilient refresh token function that handles edge cases
        return this.getHttp().post<any>(`${baseUrl}/refresh-token`, {}, { withCredentials: true })
            .pipe(
                map((account) => {
                    console.log('[AccountService] Refresh Response:', account);
                    if (account.profileImage) {
                        account.profileImage = `${environment.apiUrl}/${account.profileImage}`;
                    }
                    
                    // Check if this was a remembered login
                    const isRemembered = !!localStorage.getItem(REMEMBER_ME_KEY);
                    
                    // If tokens are returned directly, update stored tokens
                    if (account.jwtToken) {
                        if (isRemembered) {
                            localStorage.setItem(JWT_TOKEN_KEY, account.jwtToken);
                        } else {
                            sessionStorage.setItem(JWT_TOKEN_KEY, account.jwtToken);
                        }
                    }
                    
                    if (account.refreshToken) {
                        if (isRemembered) {
                            localStorage.setItem(REFRESH_TOKEN_KEY, account.refreshToken);
                        } else {
                            sessionStorage.setItem(REFRESH_TOKEN_KEY, account.refreshToken);
                        }
                    } else if (isRemembered) {
                        // If no refresh token is returned but we're in a remembered session,
                        // store the jwt token as the refresh token too to ensure persistence
                        if (account.jwtToken) {
                            localStorage.setItem(REFRESH_TOKEN_KEY, account.jwtToken);
                        }
                    }
                    
                    this.accountSubject.next(account);
                    this.startRefreshTokenTimer();
                    return account;
                }),
                catchError((err) => {
                    console.error('[AccountService] RefreshToken failed:', err);
                    
                    // Don't clear remember me data on refresh failure
                    // Only clear the tokens
                    const rememberedData = localStorage.getItem(REMEMBER_ME_KEY);
                    
                    // Reset the account subject
                    this.accountSubject.next(null);
                    
                    // Clear tokens but preserve the remember me data for next attempt
                    if (rememberedData) {
                        // Clear only tokens
                        localStorage.removeItem(JWT_TOKEN_KEY);
                        localStorage.removeItem(REFRESH_TOKEN_KEY);
                        sessionStorage.removeItem(JWT_TOKEN_KEY);
                        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
                        
                        // Make sure remember me data is still there
                        localStorage.setItem(REMEMBER_ME_KEY, rememberedData);
                    } else {
                        // Not a remembered session, clear everything
                        this.clearAuthData();
                    }
                    
                    return throwError(() => err);
                })
            );
    }

    // Account management endpoints
    register(account: Account) {
        return this.getHttp().post(`${baseUrl}/register`, account);
    }

    verifyEmail(token: string) {
        return this.getHttp().post(`${baseUrl}/verify-email`, { token });
    }

    forgotPassword(email: string) {
        return this.getHttp().post(`${baseUrl}/forgot-password`, { email });
    }

    validateResetToken(token: string) {
        return this.getHttp().post(`${baseUrl}/validate-reset-token`, { token });
    }

    resetPassword(token: string, password: string, confirmPassword: string) {
        return this.getHttp().post(`${baseUrl}/reset-password`, { token, password, confirmPassword });
    }

    // CRUD operations
    getAll() {
        return this.getHttp().get<Account[]>(baseUrl);
    }

    getById(id: string) {
        return this.getHttp().get<Account>(`${baseUrl}/${id}`)
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
        return this.getHttp().post(baseUrl, params);
    }

    update(id: string, params: any) {
        const url = `${baseUrl}/${id}`;
        console.log('Updating account with data:', params);
        return this.getHttp().put<Account>(url, params)
            .pipe(
                map(account => {
                    // Update stored account if the current user updated their own record
                    if (account.id === this.accountValue?.id) {
                        // Format profile image URL if needed
                        if (account.profileImage && !account.profileImage.startsWith('http')) {
                            account.profileImage = `${environment.apiUrl}/${account.profileImage}`;
                        }
                        
                        // Update account in subject
                        account = { ...this.accountValue, ...account };
                        this.accountSubject.next(account);
                        
                        // Store authentication data based on whether this was a remembered login
                        const isRemembered = !!localStorage.getItem(REMEMBER_ME_KEY);
                        if (isRemembered && account.jwtToken) {
                            localStorage.setItem(JWT_TOKEN_KEY, account.jwtToken);
                            if (account.refreshToken) {
                                localStorage.setItem(REFRESH_TOKEN_KEY, account.refreshToken);
                            }
                        } else if (account.jwtToken) {
                            sessionStorage.setItem(JWT_TOKEN_KEY, account.jwtToken);
                            if (account.refreshToken) {
                                sessionStorage.setItem(REFRESH_TOKEN_KEY, account.refreshToken);
                            }
                        }
                    }
                    
                    return account;
                })
            );
    }

    delete(id: string) {
        return this.getHttp().delete(`${baseUrl}/${id}`)
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

        return this.getHttp().post<any>(`${baseUrl}/upload-profile-image`, formData, { withCredentials: true })
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
        // Clear any existing timer first
        this.stopRefreshTokenTimer();
        
        // Skip if no account or no token
        if (!this.accountValue?.jwtToken) return;
        
        try {
            const jwtBase64 = this.accountValue.jwtToken.split('.')[1];
            const jwtToken = JSON.parse(atob(jwtBase64));
            const expires = new Date(jwtToken.exp * 1000);
            const timeout = expires.getTime() - Date.now() - (60 * 1000);
            
            // Only start timer if timeout is positive
            if (timeout > 0) {
                this.refreshTokenTimeout = setTimeout(() => {
                    console.log('[AccountService] Auto-refreshing token');
                    this.refreshToken().subscribe();
                }, timeout);
            } else {
                // Token already expired or very close, refresh now
                console.log('[AccountService] Token expired, refreshing immediately');
                this.refreshToken().subscribe();
            }
        } catch (e) {
            console.error('[AccountService] Error starting refresh timer:', e);
        }
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }
}