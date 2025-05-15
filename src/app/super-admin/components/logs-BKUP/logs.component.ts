import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleComponent } from '@app/shared/components/title/title.component';
import { MatDialog } from '@angular/material/dialog';
import { LogOutputViewComponent } from '../logs/log-output-view.component';
import { AccountService } from '@app/_services/account.service';
import { LogsService, LogEntry } from '@app/_services/logs.service';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, TitleComponent],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit {
  logs: LogEntry[] = [];
  selectedLogs = new Set<string>();
  currentPage = 1;
  pageSize = 10;
  totalLogs = 0;
  totalPages = 1;
  activeTab: 'system' | 'backup' = 'system';

  constructor(private dialog: MatDialog, private logsService: LogsService) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.logsService.getLogs({ page: this.currentPage, pageSize: this.pageSize }).subscribe(res => {
      this.logs = res.logs;
      this.totalLogs = res.total;
      this.totalPages = Math.ceil(this.totalLogs / this.pageSize);
    });
  }

  exportLogs() {
    alert('Exporting logs (stub)');
  }

  deleteSelected() {
    alert('Deleting selected logs (stub)');
  }

  refresh() {
    this.loadLogs();
  }

  toggleSelectAll() {
    if (this.selectedLogs.size === this.logs.length) {
      this.selectedLogs.clear();
    } else {
      this.logs.forEach(log => this.selectedLogs.add(log._id!));
    }
  }

  onLogSelect(event: any, logId: string) {
    if (event.target.checked) {
      this.selectedLogs.add(logId);
    } else {
      this.selectedLogs.delete(logId);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadLogs();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadLogs();
    }
  }

  openLogDetailsDialog(log: LogEntry) {
    this.dialog.open(LogOutputViewComponent, {
      width: '1200px',
      data: { log },
      disableClose: true
    });
  }

  viewDetails(log: LogEntry) {
    this.openLogDetailsDialog(log);
  }
}
