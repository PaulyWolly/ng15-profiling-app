import { Component, Input } from '@angular/core';
import { Account } from '@app/_models';

@Component({
  selector: 'app-business-card',
  templateUrl: './business-card.component.html',
  styleUrls: ['./business-card.component.css']
})
export class BusinessCardComponent {
  @Input() profile!: Account;
  @Input() isOwnProfile: boolean = false;
} 