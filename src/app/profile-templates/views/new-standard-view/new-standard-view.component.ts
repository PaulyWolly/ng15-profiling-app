import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { Account } from '@app/_models';

@Component({
    selector: 'app-new-standard-view',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        RouterModule
    ],
    template: `
        <div class="profile-container">
            <mat-card class="profile-card">
                <!-- Profile Header -->
                <div class="profile-header">
                    <div class="profile-image">
                        <img *ngIf="profile.profileImage" [src]="profile.profileImage" [alt]="fullName">
                        <mat-icon *ngIf="!profile.profileImage">account_circle</mat-icon>
                    </div>
                    <div class="profile-info">
                        <h1>{{ fullName }}</h1>
                        <h2 *ngIf="profile.position">{{ profile.position }}</h2>
                        <p *ngIf="profile.company">{{ profile.company }}</p>
                    </div>
                    <div class="profile-actions" *ngIf="isOwnProfile">
                        <button mat-raised-button color="primary" routerLink="/profile/edit">
                            <mat-icon>edit</mat-icon>
                            Edit Profile
                        </button>
                    </div>
                </div>

                <!-- Profile Information -->
                <div class="profile-content">
                    <mat-card-content>
                        <!-- Contact Information -->
                        <section class="contact-info">
                            <h3>Contact Information</h3>
                            <div class="info-grid">
                                <div class="info-item" *ngIf="profile.email">
                                    <mat-icon>email</mat-icon>
                                    <span>{{ profile.email }}</span>
                                </div>
                                <div class="info-item" *ngIf="profile.phone">
                                    <mat-icon>phone</mat-icon>
                                    <span>{{ profile.phone }}</span>
                                </div>
                                <div class="info-item" *ngIf="profile.mobile">
                                    <mat-icon>smartphone</mat-icon>
                                    <span>{{ profile.mobile }}</span>
                                </div>
                                <div class="info-item" *ngIf="hasAddress">
                                    <mat-icon>location_on</mat-icon>
                                    <span>{{ formatAddress }}</span>
                                </div>
                            </div>
                        </section>

                        <!-- Social Media Links -->
                        <section class="social-links" *ngIf="hasSocialLinks">
                            <h3>Social Media</h3>
                            <div class="social-grid">
                                <a *ngIf="profile.website" [href]="profile.website" target="_blank" class="social-link">
                                    <mat-icon>language</mat-icon>
                                    <span>Website</span>
                                </a>
                                <a *ngIf="profile.linkedin" [href]="profile.linkedin" target="_blank" class="social-link">
                                    <mat-icon>work</mat-icon>
                                    <span>LinkedIn</span>
                                </a>
                                <a *ngIf="profile.github" [href]="profile.github" target="_blank" class="social-link">
                                    <mat-icon>code</mat-icon>
                                    <span>GitHub</span>
                                </a>
                                <a *ngIf="profile.twitter" [href]="profile.twitter" target="_blank" class="social-link">
                                    <mat-icon>chat</mat-icon>
                                    <span>Twitter</span>
                                </a>
                            </div>
                        </section>

                        <!-- Bio Section -->
                        <section class="bio" *ngIf="profile.bio">
                            <h3>About Me</h3>
                            <p>{{ profile.bio }}</p>
                        </section>

                        <!-- Skills Section -->
                        <section class="skills" *ngIf="profile.skills?.length">
                            <h3>Skills</h3>
                            <div class="skills-grid">
                                <div class="skill-tag" *ngFor="let skill of profile.skills">
                                    {{ skill }}
                                </div>
                            </div>
                        </section>
                    </mat-card-content>
                </div>
            </mat-card>
        </div>
    `,
    styles: [`
        .profile-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .profile-card {
            background: white;
            border-radius: var(--app-border-radius);
            overflow: hidden;
        }

        .profile-header {
            display: flex;
            align-items: center;
            padding: 24px;
            background: #f5f5f5;
            gap: 24px;
        }

        .profile-image {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #e0e0e0;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            mat-icon {
                font-size: 100px;
                width: 100px;
                height: 100px;
                color: #bdbdbd;
            }
        }

        .profile-info {
            flex: 1;

            h1 {
                margin: 0;
                font-size: 2rem;
                color: #333;
            }

            h2 {
                margin: 8px 0;
                font-size: 1.2rem;
                color: #666;
            }

            p {
                margin: 0;
                color: #888;
            }
        }

        .profile-content {
            padding: 24px;

            section {
                margin-bottom: 32px;

                h3 {
                    color: #333;
                    margin-bottom: 16px;
                    font-size: 1.2rem;
                }
            }
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
        }

        .info-item {
            display: flex;
            align-items: center;
            gap: 8px;

            mat-icon {
                color: #666;
            }
        }

        .social-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
        }

        .social-link {
            display: flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
            color: #333;
            padding: 8px;
            border-radius: var(--app-border-radius);
            transition: background-color 0.2s;

            &:hover {
                background-color: #f5f5f5;
            }

            mat-icon {
                color: #666;
            }
        }

        .skills-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .skill-tag {
            background: #f5f5f5;
            padding: 4px 12px;
            border-radius: var(--app-border-radius);
            font-size: 0.9rem;
            color: #666;
        }
    `]
})
export class NewStandardViewComponent {
    @Input() profile!: Account;
    @Input() isOwnProfile = false;

    get fullName(): string {
        return `${this.profile.firstName} ${this.profile.lastName}`.trim();
    }

    get hasAddress(): boolean {
        return !!(this.profile.address && this.profile.city && this.profile.state);
    }

    get formatAddress(): string {
        return `${this.profile.address}, ${this.profile.city}, ${this.profile.state} ${this.profile.zipCode || ''}`.trim();
    }

    get hasSocialLinks(): boolean {
        return !!(
            this.profile.website ||
            this.profile.linkedin ||
            this.profile.github ||
            this.profile.twitter
        );
    }
} 