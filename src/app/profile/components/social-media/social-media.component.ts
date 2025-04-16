import { Component, Input } from '@angular/core';
import { Account } from '@app/_models';

@Component({
  selector: 'app-social-media',
  templateUrl: './social-media.component.html',
  styleUrls: ['./social-media.component.css']
})
export class SocialMediaComponent {
  @Input() profile!: Account;
  @Input() isOwnProfile: boolean = false;
} 