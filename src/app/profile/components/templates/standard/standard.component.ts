import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { UserProfile } from '../../../models/profile.model';

@Component({
  selector: 'app-standard-template',
  templateUrl: './standard.component.html',
  styleUrls: ['./standard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ]
})
export class StandardTemplateComponent {
  @Input() profile!: UserProfile;
  @Input() isOwnProfile: boolean = false;

  constructor() {}

  // Helper method to generate star array based on rating
  getStars(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }
} 