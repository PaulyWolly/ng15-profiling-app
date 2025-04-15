import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AccountService } from '@app/_services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private accountService: AccountService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError((err: HttpErrorResponse) => {
            console.log('[ErrorInterceptor] Error:', {
                status: err.status,
                statusText: err.statusText,
                url: err.url,
                error: err.error
            });

            // Handle 409 Conflict separately
            if (err.status === 409) {
                console.log('[ErrorInterceptor] Handling 409 conflict');
                return throwError(() => ({
                    status: 409,
                    error: err.error || { message: 'A conflict occurred' }
                }));
            }

            // Handle 401/403 auth errors
            if ([401, 403].includes(err.status) && 
                this.accountService.accountValue && 
                !request.url?.includes('revoke-token')) {
                this.accountService.logout();
            }

            // Handle other errors
            const error = err.error?.message || err.statusText || 'An error occurred';
            console.error('[ErrorInterceptor] Error:', error);
            return throwError(() => error);
        }));
    }
}