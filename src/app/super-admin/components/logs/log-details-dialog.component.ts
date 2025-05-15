import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { LogEntry } from './logs.component';

@Component({
  selector: 'app-log-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="log-dialog-container">
      <div class="log-dialog-header">
        <button class="close-x" (click)="dialogRef.close()" aria-label="Close">&times;</button>
        <h2 style="margin:0;">Log Entry Details</h2>
      </div>
      <div class="log-dialog-content">
        <table class="table table-sm log-details-table">
          <tr><th>Timestamp</th><td>{{formatDate(data.timestamp)}}</td></tr>
          <tr *ngIf="data.user"><th>User</th><td>{{data.user}}</td></tr>
          <tr *ngIf="data.action"><th>Action</th><td>{{data.action}}</td></tr>
          <tr *ngIf="data.status"><th>Status</th><td>{{data.status}}</td></tr>
          <tr *ngIf="data.message"><th>Message</th><td>{{data.message}}</td></tr>
          <tr *ngIf="data.ipAddress"><th>IP Address</th><td>{{data.ipAddress}}</td></tr>
          <tr *ngIf="data.geoLocation"><th>Geo Location</th><td>{{data.geoLocation}}</td></tr>
        </table>
      </div>
    </div>
  `,
  styleUrls: ['./log-output-view.component.css'],
  styles: [`
    .log-details-table th, .log-details-table td { padding: 6px 10px; }
    .log-details-table { margin: 0; }
    .log-details-table tr:first-child th,
    .log-details-table tr:first-child td {
      border-top: none !important;
    }
  `]
})
export class LogDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LogDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LogEntry
  ) {}

  formatDate(date: Date | null): string {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return '-';
    }
  }
}
