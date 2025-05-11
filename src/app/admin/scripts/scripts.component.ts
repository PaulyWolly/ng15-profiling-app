import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Script {
  name: string;
  path: string;
}

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
  scripts: Script[] = [];
  history: ScriptExecution[] = [];
  selectedScript: Script | null = null;
  isRunning = false;
  output: string = '';
  error: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadScripts();
    this.loadHistory();
  }

  loadScripts() {
    this.http.get<Script[]>(`${environment.apiUrl}/api/admin/scripts/list`, { withCredentials: true })
      .subscribe({
        next: (scripts) => {
          this.scripts = scripts;
        },
        error: (error) => {
          console.error('Error loading scripts:', error);
          this.error = 'Failed to load scripts';
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
          this.error = 'Failed to load script history';
        }
      });
  }

  runScript(script: Script) {
    this.selectedScript = script;
    this.isRunning = true;
    this.output = '';
    this.error = '';

    this.http.post<{ success: boolean; output: string; error: string }>(
      `${environment.apiUrl}/api/admin/scripts/run/${script.name}`,
      {},
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.output = response.output;
        this.error = response.error;
        this.isRunning = false;
        this.loadHistory();
      },
      error: (error) => {
        console.error('Error running script:', error);
        this.error = 'Failed to run script';
        this.isRunning = false;
      }
    });
  }
} 