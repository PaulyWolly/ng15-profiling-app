import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserProfile } from '../../models/profile.model';

@Component({
  selector: 'app-business-template',
  templateUrl: './business-template.component.html',
  styleUrls: ['./business-template.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class BusinessTemplateComponent {
  @Input() profile!: UserProfile;
} 