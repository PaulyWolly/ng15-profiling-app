import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserProfile } from '../../../models/profile.model';

@Component({
  selector: 'app-business-template',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.css'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule]
})
export class BusinessTemplateComponent {
  @Input() profile!: UserProfile;
} 