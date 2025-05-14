import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-command-modal-input',
  standalone: true,
  imports: [CommonModule],
  template: '<div>Command Modal Input Stub<br>{{ data | json }}</div>'
})
export class CommandModalInputComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  // Stubs for dynamic methods used in scripts.component.ts
  updateOutput(output: string, sessionId: string) {}
  onSubmitInput: (input: string, sessionId: string) => void = () => {};
}
