import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-create-log-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>Create {{ data.logType }} Log</h2>
    <div mat-dialog-content>
      <form [formGroup]="logForm">
        <mat-form-field class="w-100 mb-3">
          <mat-label>Action</mat-label>
          <input matInput formControlName="action" placeholder="Enter action">
          <mat-error *ngIf="logForm.get('action')?.errors?.['required']">Action is required</mat-error>
        </mat-form-field>

        <mat-form-field class="w-100 mb-3">
          <mat-label>Message</mat-label>
          <textarea matInput formControlName="message" rows="4" placeholder="Enter log message"></textarea>
          <mat-error *ngIf="logForm.get('message')?.errors?.['required']">Message is required</mat-error>
        </mat-form-field>

        <mat-form-field class="w-100 mb-3">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="Success">Success</mat-option>
            <mat-option value="Warning">Warning</mat-option>
            <mat-option value="Error">Error</mat-option>
            <mat-option value="Info">Info</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field *ngIf="data.logType === 'User' || data.logType === 'Audit'" class="w-100 mb-3">
          <mat-label>User</mat-label>
          <input matInput formControlName="user" placeholder="Enter username">
          <mat-error *ngIf="logForm.get('user')?.errors?.['required']">User is required</mat-error>
        </mat-form-field>

        <mat-form-field class="w-100 mb-3">
          <mat-label>IP Address (optional)</mat-label>
          <input matInput formControlName="ipAddress" placeholder="Enter IP address">
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions class="d-flex justify-content-end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="logForm.invalid" (click)="onSubmit()">Create</button>
    </div>
  `
})
export class CreateLogDialogComponent {
  logForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateLogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { logType: 'System' | 'User' | 'Error' | 'Audit' }
  ) {
    // Create the form based on log type
    const baseControls = {
      action: ['', Validators.required],
      message: ['', Validators.required],
      status: ['Info', Validators.required],
      ipAddress: ['']
    };

    // Add user field for User and Audit logs
    if (data.logType === 'User' || data.logType === 'Audit') {
      this.logForm = this.fb.group({
        ...baseControls,
        user: ['', Validators.required]
      });
    } else {
      this.logForm = this.fb.group(baseControls);

      // For Error logs, default status to Error
      if (data.logType === 'Error') {
        this.logForm.get('status')?.setValue('Error');
      }
    }
  }

  onSubmit(): void {
    if (this.logForm.valid) {
      this.dialogRef.close(this.logForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
