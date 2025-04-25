import { Component, Input } from '@angular/core';
import { UserProfile } from '../../../models/profile.model';

@Component({
  selector: 'app-standard-template',
  templateUrl: './standard.component.html',
  styleUrls: ['./standard.component.css'],
  standalone: true
})
export class StandardTemplateComponent {
  @Input() profile!: UserProfile;
} 