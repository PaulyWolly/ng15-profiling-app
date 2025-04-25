import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AssetService {
    constructor() {}

    getAssetUrl(path: string): string {
        // Remove any leading slash
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        
        // Get the base URL from the window location
        const baseUrl = window.location.origin;
        
        // Combine the base URL with the asset path
        return `${baseUrl}/${cleanPath}`;
    }
} 