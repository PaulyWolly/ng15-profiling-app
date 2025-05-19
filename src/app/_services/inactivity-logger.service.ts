import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class InactivityLoggerService {
    constructor(private http: HttpClient) {}

    /**
     * Log an inactivity warning event
     */
    logInactivityWarning() {
        return this.http.post(`${environment.apiUrl}/logs/inactivity`, {
            type: 'InactivityWarning',
            action: 'Warning',
            message: 'User received inactivity warning'
        });
    }

    /**
     * Log an inactivity timeout event
     */
    logInactivityTimeout() {
        return this.http.post(`${environment.apiUrl}/logs/inactivity`, {
            type: 'InactivityTimeout',
            action: 'Timeout',
            message: 'User logged out due to inactivity'
        });
    }

    /**
     * Log a user response to inactivity warning
     * @param response 'yes' if user chose to stay logged in, 'no' if user chose to log out
     */
    logInactivityResponse(response: 'yes' | 'no') {
        return this.http.post(`${environment.apiUrl}/logs/inactivity`, {
            type: 'InactivityResponse',
            action: response === 'yes' ? 'StayLoggedIn' : 'Logout',
            message: `User chose to ${response === 'yes' ? 'stay logged in' : 'log out'} after inactivity warning`
        });
    }
}
