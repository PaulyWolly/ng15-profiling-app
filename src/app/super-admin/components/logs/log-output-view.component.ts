import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { LogsService } from '@app/_services/logs.service';

interface LogEntry {
  id: string;
  type: 'User' | 'System' | 'Error' | 'Audit';
  timestamp: Date;
  user?: string;
  action: string;
  status: 'Success' | 'Warning' | 'Error' | 'Info';
  message: string;
  ipAddress?: string;
  meta?: any;
}

interface Log {
  type: 'User' | 'System' | 'Error' | 'Audit';
  user?: string;
  action: string;
  entries: LogEntry[];
}

@Component({
  selector: 'app-log-output-view',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, FormsModule],
  templateUrl: './log-output-view.component.html',
  styleUrls: ['./log-output-view.component.css']
})
export class LogOutputViewComponent {
  messagePage = 0;
  messagePageSize = 1000; // characters per page
  messageTotalPages = 1;
  metaString = '';

  checked: boolean[] = [];
  get allChecked() {
    return this.checked.length > 0 && this.checked.every(v => v);
  }
  get anyChecked() {
    return this.checked.some(v => v);
  }
  toggleAllChecked(event: any) {
    this.checked = this.checked.map(() => event.target.checked);
  }
  deleteChecked() {
    // Delete checked entries from the backend and UI
    const logId = this.data.log._id;
    // Collect indices to delete (in reverse order to avoid index shift)
    const indicesToDelete = this.checked
      .map((v, i) => v ? i : -1)
      .filter(i => i !== -1)
      .sort((a, b) => b - a);
    indicesToDelete.forEach(idx => {
      this.logsService.deleteLogEntry(logId, idx).subscribe({
        next: () => {
          this.data.log.entries.splice(idx, 1);
          this.checked.splice(idx, 1);
        },
        error: err => {
          // Optionally show error to user
          console.error('Failed to delete log entry', err);
        }
      });
    });
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { log: Log & { _id: string } },
    private dialogRef: MatDialogRef<LogOutputViewComponent>,
    private logsService: LogsService
  ) {
    this.checked = new Array(data.log.entries.length).fill(false);
    if (this.isMessagePaginated()) {
      this.messageTotalPages = Math.ceil(data.log.entries[0].message.length / this.messagePageSize);
    }
  }

  isMessagePaginated() {
    return this.data.log.entries[0].message && this.data.log.entries[0].message.length > this.messagePageSize;
  }

  getMessagePage() {
    const start = this.messagePage * this.messagePageSize;
    return this.data.log.entries[0].message.substring(start, start + this.messagePageSize);
  }

  nextMessagePage() {
    if (this.messagePage < this.messageTotalPages - 1) {
      this.messagePage++;
    }
  }

  prevMessagePage() {
    if (this.messagePage > 0) {
      this.messagePage--;
    }
  }

  close() {
    this.dialogRef.close();
  }
}
