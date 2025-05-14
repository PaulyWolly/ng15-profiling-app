import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-command-modal',
  standalone: true,
  imports: [CommonModule],
  template: '<div>Command Modal Stub<br>{{ data | json }}</div>'
})
export class CommandModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
