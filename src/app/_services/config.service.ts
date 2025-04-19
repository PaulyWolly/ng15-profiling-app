import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any = {};
  private loaded = false;

  constructor(private http: HttpClient) {}

  /**
   * Load configuration from the server
   * This should be called during app initialization
   */
  async loadConfig(): Promise<void> {
    if (this.loaded) return;
    
    try {
      // Fetch configuration from the secure server endpoint
      this.config = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/config`)
      );
      
      // If API key is still not available, log a warning
      if (!this.config?.apiKeys?.googleMaps) {
        console.warn('Google Maps API key not available from server. Check server configuration.');
      }
      
      this.loaded = true;
    } catch (error) {
      console.error('Failed to load configuration:', error);
      // Fallback to empty config
      this.config = { apiKeys: { googleMaps: '' } };
      this.loaded = true;
    }
  }

  /**
   * Get the Google Maps API key
   */
  getGoogleMapsApiKey(): string {
    if (!this.loaded) {
      console.warn('Config not loaded yet. Call loadConfig() first.');
      return '';
    }
    return this.config?.apiKeys?.googleMaps || '';
  }
} 