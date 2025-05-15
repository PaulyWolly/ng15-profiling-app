import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-inactivity-dialog',
  templateUrl: './inactivity-dialog.component.html',
  styleUrls: ['./inactivity-dialog.component.css']
})
export class InactivityDialogComponent implements OnDestroy {
  countdown: number = 180; // 3 minutes in seconds
  interval: any;

  constructor(
    public dialogRef: MatDialogRef<InactivityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.startCountdown();
  }

  startCountdown() {
    this.interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.dialogRef.close('timeout');
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  onYes() {
    this.dialogRef.close('yes');
  }

  onNo() {
    this.dialogRef.close('no');
  }
}
