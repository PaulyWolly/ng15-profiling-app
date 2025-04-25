import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { UserProfile } from '../../../models/profile.model';

@Component({
  selector: 'app-social-template',
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatIconModule,
    MatCardModule,
    MatBadgeModule
  ]
})
export class SocialTemplateComponent {
  @Input() profile!: UserProfile;
} 