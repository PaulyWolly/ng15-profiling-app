import { Component, Inject, Input, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-command-modal',
  template: `
    <div class="noninput-title-bar">
      <span>Command Window</span>
      <button class="noninput-close" (click)="close()" aria-label="Close">&times;</button>
    </div>
    <div class="noninput-command-window">
      <div class="noninput-script-name">Running: {{ scriptName }}</div>
      <div class="noninput-output-area" #outputArea>{{ output }}</div>
      <div *ngIf="error" class="noninput-error-area">{{ error }}</div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .mat-dialog-container,
    .noninput-title-bar,
    .noninput-command-window {
      border-radius: 0 !important;
      border-top-left-radius: 0 !important;
      border-top-right-radius: 0 !important;
      border-bottom-left-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
    }
    .noninput-title-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #222;
      color: #fff;
      font-family: Consolas, 'Courier New', monospace;
      font-size: 1.1rem;
      padding: 0.5rem 1rem;
    }
    .noninput-close {
      background: none;
      border: none;
      color: #fff;
      font-size: 1.5rem;
      cursor: pointer;
      line-height: 1;
      padding: 0 0.5rem;
      transition: color 0.2s;
    }
    .noninput-close:hover {
      color: #f44336;
    }
    .noninput-command-window {
      background: #111;
      color: #e0e0e0;
      padding: 0;
      min-width: 800px;
      min-height: 440px;
      max-width: 1200px;
      max-height: 800px;
      font-family: Consolas, 'Courier New', monospace;
      height: 100%;
    }
    .noninput-script-name {
      color: #42a5f5;
      font-family: Consolas, 'Courier New', monospace;
      font-size: 1.1rem;
      padding: 0.5rem 1rem 0.25rem 1rem;
    }
    .noninput-output-area {
      background: #111;
      color: #90ee90;
      padding: 1rem;
      min-height: 60px;
      margin-bottom: 0;
      white-space: pre-wrap;
      font-family: Consolas, 'Courier New', monospace;
      font-size: 1rem;
      overflow-y: scroll;
      border-bottom: 1px solid #222;
      max-height: 410px;
      scrollbar-width: thin;
      scrollbar-color: #888 #222;
    }
    .noninput-error-area {
      color: #f44336;
      background: #111;
      padding: 1rem;
      font-family: Consolas, 'Courier New', monospace;
      font-size: 1rem;
      white-space: pre-wrap;
    }
    .noninput-output-area::-webkit-scrollbar {
      width: 12px;
      background: #222;
    }
    .noninput-output-area::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 6px;
    }
  `],
  encapsulation: ViewEncapsulation.Emulated
})
export class CommandModalComponent {
  @Input() output: string = '';
  @Input() scriptName: string = '';
  @Input() error: string = '';
  @Input() sessionId: string = '';
  userInput: string = '';
  done: boolean = false;
  @ViewChild('cmdInput') cmdInputRef!: ElementRef<HTMLInputElement>;

  // Function to be set by parent for handling input
  onSubmitInput: (input: string, sessionId: string) => void = () => {};

  constructor(
    public dialogRef: MatDialogRef<CommandModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.output = data.output;
    this.sessionId = data.sessionId;
    this.scriptName = data.scriptName;
  }

  submitInput() {
    if (this.onSubmitInput) {
      this.onSubmitInput(this.userInput, this.sessionId);
    }
  }

  updateOutput(newOutput: string, sessionId: string) {
    this.output = newOutput;
    this.sessionId = sessionId;
    this.userInput = '';
    setTimeout(() => {
      this.cmdInputRef?.nativeElement.focus();
    }, 0);
  }

  close() {
    this.dialogRef.close();
  }

  focusInput() {
    setTimeout(() => {
      this.cmdInputRef?.nativeElement.focus();
    }, 0);
  }
} 