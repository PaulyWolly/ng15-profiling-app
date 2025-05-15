import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '@environments/environment';

export interface LogEntry {
  _id?: string;
  type: 'User' | 'System' | 'Error' | 'Audit';
  timestamp: string;
  user?: string;
  action: string;
  status: 'Success' | 'Warning' | 'Error' | 'Info';
  message: string;
  ipAddress?: string;
  geoLocation?: string;
  userAgent?: string;
  responseTime?: number;
  pageUrl?: string;
  referrer?: string;
}

export interface LogRequest {
  action: string;
  message: string;
  status?: 'Success' | 'Warning' | 'Error' | 'Info';
  ipAddress?: string;
  user?: string;
  geoLocation?: string;
  userAgent?: string;
  responseTime?: number;
  pageUrl?: string;
  referrer?: string;
  sessionId?: string;
}

export interface LogResponse {
  _id: string;
  type: string;
  user?: string;
  action: string;
  entries: {
    message: string;
    timestamp: string;
    status: string;
    ipAddress?: string;
    geoLocation?: string;
    userAgent?: string;
    responseTime?: number;
    pageUrl?: string;
    referrer?: string;
    _id: string;
  }[];
  sessionId?: string;
  sessionStartTime?: Date;
  sessionEndTime?: Date;
}

@Injectable({ providedIn: 'root' })
export class LogsService {
  private apiUrl = `${environment.apiUrl}/logs`;
  private sessionStart: number | null = null;
  private currentPageStart: number | null = null;
  private lastPageUrl: string | null = null;

  constructor(private http: HttpClient) {
    // Listen for session events
    window.addEventListener('beforeunload', () => this.handleBeforeUnload());
  }

  /**
   * Handle page unload event to log session duration
   */
  private handleBeforeUnload() {
    if (this.sessionStart) {
      const duration = Date.now() - this.sessionStart;
      // Only log if session was at least 5 seconds
      if (duration > 5000) {
        this.logUser(
          'User',
          'Session End',
          `User session ended after ${this.formatDuration(duration)}`,
          'Info'
        );
      }
    }
  }

  /**
   * Format a duration in milliseconds to a human-readable string
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  getLogs(params?: any): Observable<{ logs: LogEntry[]; total: number }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<{ logs: LogEntry[]; total: number }>(this.apiUrl, { params: httpParams });
  }

  deleteLogEntry(logId: string, entryIndex: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${logId}/entry/${entryIndex}`);
  }

  /**
   * Create a system log and handle errors silently
   * @param action The action being performed
   * @param message The log message
   * @param status Log status
   */
  logSystem(action: string, message: string, status: 'Success' | 'Warning' | 'Error' | 'Info' = 'Info'): void {
    this.createSystemLog({ action, message, status })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  /**
   * Create a user log and handle errors silently
   * @param user The username
   * @param action The action being performed
   * @param message The log message
   * @param status Log status
   */
  logUser(user: string, action: string, message: string, status: 'Success' | 'Warning' | 'Error' | 'Info' = 'Info'): void {
    // If this is a login event, mark the session start
    if (action.toLowerCase().includes('login') && status === 'Success') {
      this.sessionStart = Date.now();
    }

    // If this is a logout event, calculate session duration
    if (action.toLowerCase().includes('logout') && this.sessionStart) {
      const duration = Date.now() - this.sessionStart;
      message += `\nSession duration: ${this.formatDuration(duration)}`;
      this.sessionStart = null;
    }

    this.createUserLog({ user, action, message, status })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  /**
   * Log page navigation and time spent
   * @param user The username
   * @param fromUrl The URL the user navigated from
   * @param toUrl The URL the user navigated to
   * @param timeSpentMs Time spent on the previous page in milliseconds
   */
  logPageNavigation(user: string, fromUrl: string, toUrl: string, timeSpentMs: number): void {
    const formattedTime = this.formatDuration(timeSpentMs);
    const message = `Navigated from ${fromUrl} to ${toUrl}\nTime spent: ${formattedTime}`;

    this.createUserLog({
      user,
      action: 'Page Navigation',
      message,
      status: 'Info',
      pageUrl: fromUrl,
      referrer: toUrl,
      responseTime: timeSpentMs
    })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  /**
   * Create an error log and handle errors silently
   * @param action The action being performed
   * @param message The error message
   * @param user Optional username
   */
  logError(action: string, message: string, user?: string): void {
    this.createErrorLog({ action, message, user })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  /**
   * Create an audit log and handle errors silently
   * @param user The username
   * @param action The action being performed
   * @param message The log message
   * @param status Log status
   */
  logAudit(user: string, action: string, message: string, status: 'Success' | 'Warning' | 'Error' | 'Info' = 'Info'): void {
    this.createAuditLog({ user, action, message, status })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  // Create a system log
  createSystemLog(data: LogRequest): Observable<LogResponse> {
    return this.http.post<LogResponse>(`${this.apiUrl}/system`, data);
  }

  // Create a user log
  createUserLog(data: LogRequest & { user: string }): Observable<LogResponse> {
    // Add browser info if not provided
    if (!data.userAgent) {
      data.userAgent = navigator.userAgent;
    }

    return this.http.post<LogResponse>(`${this.apiUrl}/user`, data);
  }

  // Create an error log
  createErrorLog(data: LogRequest): Observable<LogResponse> {
    // Add browser info if not provided
    if (!data.userAgent) {
      data.userAgent = navigator.userAgent;
    }

    return this.http.post<LogResponse>(`${this.apiUrl}/error`, data);
  }

  // Create an audit log
  createAuditLog(data: LogRequest & { user: string }): Observable<LogResponse> {
    return this.http.post<LogResponse>(`${this.apiUrl}/audit`, data);
  }

  // Add an entry to an existing log
  addLogEntry(logId: string, message: string, status: string = 'Info', ipAddress?: string): Observable<LogResponse> {
    return this.http.post<LogResponse>(`${this.apiUrl}/${logId}/entries`, { message, status, ipAddress });
  }
}
