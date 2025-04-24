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

            // Handle other errors - Re-throw a structured error or the original HttpErrorResponse
            // This provides more context to the component catching the error.
            const errorPayload = err.error || { message: err.statusText || 'An unknown error occurred' };
            console.error(`[ErrorInterceptor] Passing error downstream: Status ${err.status}`, errorPayload);
            // Option 1: Re-throw a custom object (allows component to check status)
            // return throwError(() => ({ status: err.status, message: errorPayload.message, error: err })); 
            // Option 2: Re-throw the original HttpErrorResponse (gives full context)
            return throwError(() => err); 
        }));
    }
}