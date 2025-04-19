import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '@environments/environment';

export interface MapDialogData {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

@Component({
  selector: 'app-map-dialog',
  templateUrl: './map-dialog.component.html',
  styleUrls: ['./map-dialog.component.css']
})
export class MapDialogComponent implements OnInit {
  mapUrl: SafeResourceUrl;
  fullAddress: string;

  constructor(
    private sanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<MapDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MapDialogData
  ) {
    // Combine address components
    this.fullAddress = [
      data.address,
      data.city,
      data.state,
      data.zipCode
    ].filter(Boolean).join(', ');

    // Create and sanitize the Google Maps URL
    const encodedAddress = encodeURIComponent(this.fullAddress);
    const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=${environment.googleMapsApiKey}&q=${encodedAddress}`;
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(googleMapsUrl);
  }

  ngOnInit(): void {}

  closeDialog(): void {
    this.dialogRef.close();
  }
} 