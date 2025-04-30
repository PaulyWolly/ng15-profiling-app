import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-curved-border',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './curved-border.component.html',
  styleUrls: ['./curved-border.component.css']
})
export class CurvedBorderComponent {
  @Input() top: number = 20;
  @Input() left: number = 24;
  @Input() right: number = 24;
  @Input() height: number = 300;
  @Input() borderColor: string = '#eebbbb';
  @Input() borderWidth: number = 4;
  @Input() borderRadius: number = 24;
}
