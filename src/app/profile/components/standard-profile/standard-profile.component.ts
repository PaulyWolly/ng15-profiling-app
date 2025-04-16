import { Component, Input } from '@angular/core';
import { Account } from '@app/_models';

@Component({
  selector: 'app-standard-profile',
  templateUrl: './standard-profile.component.html',
  styleUrls: ['./standard-profile.component.css']
})
export class StandardProfileComponent {
  @Input() profile!: Account;
  @Input() isOwnProfile: boolean = false;
} 