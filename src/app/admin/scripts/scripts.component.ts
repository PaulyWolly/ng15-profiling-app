import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CommandModalComponent } from './command-modal.component';

interface ScriptExecution {
  script: string;
  timestamp: Date;
  output: string;
  error: string;
}

@Component({
  selector: 'app-scripts',
  templateUrl: './scripts.component.html',
  styleUrls: ['./scripts.component.scss']
})
export class ScriptsComponent implements OnInit {
  scripts: string[] = [];
  history: ScriptExecution[] = [];
  selectedScript: string | null = null;
  isRunning = false;
  output: string = '';
  error: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadScripts();
    this.loadHistory();
  }

  loadScripts() {
    this.http.get<string[]>(`${environment.apiUrl}/api/admin/scripts`, { withCredentials: true })
      .subscribe({
        next: (scripts) => {
          this.scripts = scripts;
        },
        error: (error) => {
          console.error('Error loading scripts:', error);
          if (error.status === 401 || error.status === 403) {
            this.router.navigate(['/login']);
          } else {
            this.error = 'Failed to load scripts';
          }
        }
      });
  }

  loadHistory() {
    this.http.get<ScriptExecution[]>(`${environment.apiUrl}/api/admin/scripts/history`, { withCredentials: true })
      .subscribe({
        next: (history) => {
          this.history = history;
        },
        error: (error) => {
          console.error('Error loading history:', error);
          if (error.status === 401 || error.status === 403) {
            this.router.navigate(['/login']);
          } else {
            this.error = 'Failed to load script history';
          }
        }
      });
  }

  runScript(script: string) {
    if (script === 'hello-user.js') {
      // Start interactive session
      this.http.post<any>(`${environment.apiUrl}/api/admin/scripts/interactive-run/start`, { scriptName: script }, { withCredentials: true })
        .subscribe({
          next: (res) => {
            const dialogRef = this.dialog.open(CommandModalComponent, {
              data: { output: res.output, sessionId: res.sessionId },
              width: '500px',
              disableClose: true
            });
            const dialogComponent = dialogRef.componentInstance;
            dialogRef.afterClosed().subscribe();
            dialogComponent.onSubmitInput = (input: string, sessionId: string) => {
              this.http.post<any>(`${environment.apiUrl}/api/admin/scripts/interactive-run/input`, { sessionId, input }, { withCredentials: true })
                .subscribe({
                  next: (resp) => {
                    dialogComponent.updateOutput(resp.output, sessionId);
                  },
                  error: (err) => {
                    alert('Error sending input: ' + (err.error?.error || err.message));
                  }
                });
            };
          },
          error: (err) => {
            alert('Error starting interactive script: ' + (err.error?.error || err.message));
          }
        });
      return;
    }
    this.selectedScript = script;
    this.isRunning = true;
    this.output = '';
    this.error = '';

    this.http.post<{ code: number; stdout: string; stderr: string }>(
      `${environment.apiUrl}/api/admin/scripts/run`,
      { scriptName: script },
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.output = response.stdout;
        this.error = response.stderr;
        this.isRunning = false;
        this.loadHistory();
      },
      error: (error) => {
        console.error('Error running script:', error);
        if (error.status === 401 || error.status === 403) {
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to run script';
        }
        this.isRunning = false;
      }
    });
  }

  deleteHistoryItem(entry: ScriptExecution) {
    if (confirm('Are you sure you want to delete this history entry?')) {
      this.history = this.history.filter(e => e !== entry);
      // TODO: Optionally, send a request to the backend to delete the entry from the database
    }
  }
} 