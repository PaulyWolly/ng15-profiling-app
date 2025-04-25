import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserProfile } from '../../models/profile.model';

@Component({
  selector: 'app-standard-template',
  templateUrl: './standard-template.component.html',
  styleUrls: ['./standard-template.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class StandardTemplateComponent {
  @Input() profile!: UserProfile;
} 