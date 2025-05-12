import { Component, Inject, Input, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-command-modal',
  template: `
    <div class="cmd-title-bar">
      <span>Command Window</span>
      <button class="cmd-close" (click)="close()" aria-label="Close">&times;</button>
    </div>
    <div class="command-window">
      <div class="output-area" #outputArea>{{ output }}</div>
      <form (ngSubmit)="submitInput()" *ngIf="!done" class="input-form">
        <div class="cmd-prompt-row">
          <span class="cmd-prompt">C:\Users\pwelb&gt;</span>
          <div class="cmd-input-row">
            <input
              #cmdInput
              class="cmd-input"
              [(ngModel)]="userInput"
              name="userInput"
              autocomplete="off"
              required
              autofocus
              (keydown.enter)="submitInput()"
              type="text"
            />
            <button class="go-btn" type="submit">Go</button>
          </div>
        </div>
      </form>
      <div *ngIf="done" class="done-msg">Session complete.</div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .mat-dialog-container,
    .cmd-title-bar,
    .command-window,
    .input-form {
      border-radius: 0 !important;
      border-top-left-radius: 0 !important;
      border-top-right-radius: 0 !important;
      border-bottom-left-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
    }
    .cmd-title-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #222;
      color: #fff;
      font-family: Consolas, 'Courier New', monospace;
      font-size: 1.1rem;
      padding: 0.5rem 1rem;
    }
    .cmd-close {
      background: none;
      border: none;
      color: #fff;
      font-size: 1.5rem;
      cursor: pointer;
      line-height: 1;
      padding: 0 0.5rem;
      transition: color 0.2s;
    }
    .cmd-close:hover {
      color: #f44336;
    }
    .command-window {
      background: #111;
      color: #e0e0e0;
      padding: 0;
      min-width: 400px;
      min-height: 220px;
      max-width: 600px;
      max-height: 400px;
      font-family: Consolas, 'Courier New', monospace;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .output-area {
      background: #111;
      color: #90ee90;
      padding: 1rem;
      min-height: 60px;
      flex: 1 1 auto;
      margin-bottom: 0;
      white-space: pre-wrap;
      font-family: Consolas, 'Courier New', monospace;
      font-size: 1rem;
      overflow-y: auto;
      border-bottom: 1px solid #222;
    }
    .input-form {
      width: 100%;
      margin: 0;
      padding: 1rem;
      box-sizing: border-box;
      background: #111;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .cmd-prompt-row {
      display: flex;
      align-items: center;
      width: 100%;
    }
    .cmd-prompt {
      color: #fff;
      font-family: Consolas, 'Courier New', monospace;
      font-size: 1rem;
      margin-right: 0.5rem;
      user-select: none;
    }
    .cmd-input-row {
      display: flex;
      align-items: center;
      width: 100%;
    }
    .cmd-input {
      background: #000;
      color: #fff;
      border: 1px solid #fff;
      border-radius: 0;
      font-family: Consolas, 'Courier New', monospace;
      font-size: 1rem;
      padding: 0.25rem 0.5rem;
      flex: 1;
      height: 36px;
      outline: none;
      margin: 0;
    }
    .go-btn {
      margin-left: 0.5rem;
      min-width: 48px;
      height: 36px;
      background: #3f51b5;
      color: #fff;
      border: none;
      font-family: inherit;
      font-size: 1rem;
      cursor: pointer;
      border-radius: 0;
    }
    .go-btn:hover {
      background: #283593;
    }
    .done-msg { color: #90ee90; margin: 1rem 0 0 1rem; }
  `],
  encapsulation: ViewEncapsulation.None
})
export class CommandModalComponent {
  @Input() output: string = '';
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
} 