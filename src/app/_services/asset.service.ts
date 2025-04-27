import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AssetService {
    constructor() {}

    getAssetUrl(path: string): string {
        // Remove any leading slash
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        // Use backend port for assets
        const assetBaseUrl = 'http://localhost:5001';
        return `${assetBaseUrl}/${cleanPath}`;
    }
} 