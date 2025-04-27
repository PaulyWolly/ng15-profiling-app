import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { Account } from '@app/_models';
import { environment } from '@environments/environment';

@Component({
    selector: 'app-new-social-media-view',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatDividerModule,
        MatChipsModule,
        MatBadgeModule,
        MatMenuModule,
        RouterModule
    ],
    template: `
        <div class="social-profile-container">
            <!-- Cover Image Section -->
            <div class="cover-image">
                <img *ngIf="profile?.coverImage" [src]="getImageUrl(profile.coverImage)" alt="Cover photo">
                <div *ngIf="!profile?.coverImage" class="default-cover"></div>
                
                <!-- Profile Navigation -->
                <div class="profile-nav">
                    <div class="nav-links">
                        <button mat-button class="nav-item active" (click)="activeTab = 'posts'">
                            Posts
                            <span class="count">12</span>
                        </button>
                        <button mat-button class="nav-item" (click)="activeTab = 'about'">
                            About
                        </button>
                        <button mat-button class="nav-item" (click)="activeTab = 'photos'">
                            Photos
                            <span class="count">24</span>
                        </button>
                        <button mat-button class="nav-item" (click)="activeTab = 'friends'">
                            Friends
                            <span class="count">168</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="content-layout">
                <!-- Left Sidebar -->
                <div class="sidebar">
                    <!-- Profile Card -->
                    <mat-card class="profile-card">
                        <div class="profile-header">
                            <!-- Profile Image -->
                            <div class="profile-image-container">
                                <img *ngIf="profile?.profileImage" 
                                     [src]="getImageUrl(profile.profileImage)" 
                                     [alt]="profile.firstName + ' ' + profile.lastName"
                                     class="profile-image"
                                     (error)="onImageError($event)">
                                <div *ngIf="!profile?.profileImage || imageError" class="default-avatar">
                                    <mat-icon>account_circle</mat-icon>
                                </div>
                                <button mat-mini-fab color="primary" class="edit-photo-btn" *ngIf="isOwnProfile">
                                    <mat-icon>photo_camera</mat-icon>
                                </button>
                            </div>

                            <!-- Profile Info -->
                            <div class="profile-info">
                                <div class="name-section">
                                    <div class="name-container">
                                        <h1>{{ profile.firstName }} {{ profile.lastName }}</h1>
                                        <span class="username" *ngIf="profile?.username">{{'@' + profile.username}}</span>
                                    </div>
                                    <button mat-icon-button [matMenuTriggerFor]="profileMenu" *ngIf="isOwnProfile">
                                        <mat-icon>more_vert</mat-icon>
                                    </button>
                                    <mat-menu #profileMenu="matMenu">
                                        <button mat-menu-item routerLink="/profile/edit">
                                            <mat-icon>edit</mat-icon>
                                            Edit Profile
                                        </button>
                                        <button mat-menu-item>
                                            <mat-icon>settings</mat-icon>
                                            Settings
                                        </button>
                                    </mat-menu>
                                </div>
                                
                                <p class="bio" *ngIf="profile?.bio">{{ profile.bio }}</p>

                                <div class="location-info" *ngIf="profile?.city || profile?.state">
                                    <mat-icon>location_on</mat-icon>
                                    <span>{{ profile.city }}, {{ profile.state }}</span>
                                </div>

                                <div class="stats-section">
                                    <button mat-button class="stat-item">
                                        <span class="count">{{ profile.followersCount || 0 }}</span>
                                        <span class="label">Followers</span>
                                    </button>
                                    <button mat-button class="stat-item">
                                        <span class="count">{{ profile.followingCount || 0 }}</span>
                                        <span class="label">Following</span>
                                    </button>
                                </div>

                                <div class="action-buttons" *ngIf="!isOwnProfile">
                                    <button mat-raised-button color="primary" class="follow-btn">
                                        <mat-icon>person_add</mat-icon>
                                        Follow
                                    </button>
                                    <button mat-stroked-button color="primary">
                                        <mat-icon>message</mat-icon>
                                        Message
                                    </button>
                                </div>
                            </div>
                        </div>
                    </mat-card>

                    <!-- Social Links Card -->
                    <mat-card class="social-links-card">
                        <mat-card-header>
                            <mat-card-title>Social Links</mat-card-title>
                            <button mat-icon-button *ngIf="isOwnProfile">
                                <mat-icon>edit</mat-icon>
                            </button>
                        </mat-card-header>
                        <mat-card-content>
                            <div class="social-link" *ngIf="profile?.website">
                                <mat-icon>language</mat-icon>
                                <a [href]="profile.website" target="_blank">{{ formatUrl(profile.website) }}</a>
                            </div>
                            <div class="social-link" *ngIf="profile?.github">
                                <mat-icon>code</mat-icon>
                                <a [href]="profile.github" target="_blank">GitHub</a>
                            </div>
                            <div class="social-link" *ngIf="profile?.linkedin">
                                <mat-icon>work</mat-icon>
                                <a [href]="profile.linkedin" target="_blank">LinkedIn</a>
                            </div>
                            <div class="social-link" *ngIf="profile?.twitter">
                                <mat-icon>chat</mat-icon>
                                <a [href]="profile.twitter" target="_blank">Twitter</a>
                            </div>
                            <div class="add-social" *ngIf="isOwnProfile && !hasSocialLinks">
                                <button mat-stroked-button color="primary">
                                    <mat-icon>add</mat-icon>
                                    Add Social Links
                                </button>
                            </div>
                        </mat-card-content>
                    </mat-card>

                    <!-- Photos Preview Card -->
                    <mat-card class="photos-card">
                        <mat-card-header>
                            <mat-card-title>Photos</mat-card-title>
                            <button mat-button color="primary">See All</button>
                        </mat-card-header>
                        <mat-card-content>
                            <div class="photos-grid">
                                <div class="photo-item" *ngFor="let i of [1,2,3,4,5,6]">
                                    <div class="photo-placeholder"></div>
                                </div>
                            </div>
                        </mat-card-content>
                    </mat-card>
                </div>

                <!-- Main Content -->
                <div class="main-content">
                    <!-- Create Post Card -->
                    <mat-card class="create-post-card" *ngIf="isOwnProfile">
                        <mat-card-content>
                            <div class="post-input">
                                <img *ngIf="profile?.profileImage" 
                                     [src]="profile.profileImage" 
                                     [alt]="profile.firstName"
                                     class="avatar-image">
                                <div *ngIf="!profile?.profileImage" class="avatar-icon-container">
                                    <mat-icon>account_circle</mat-icon>
                                </div>
                                <button mat-button class="post-button">What's on your mind?</button>
                            </div>
                            <mat-divider></mat-divider>
                            <div class="post-actions">
                                <button mat-button>
                                    <mat-icon>photo_camera</mat-icon>
                                    Photo
                                </button>
                                <button mat-button>
                                    <mat-icon>videocam</mat-icon>
                                    Video
                                </button>
                                <button mat-button>
                                    <mat-icon>event</mat-icon>
                                    Event
                                </button>
                            </div>
                        </mat-card-content>
                    </mat-card>

                    <!-- Activity Feed -->
                    <div class="activity-feed">
                        <mat-card class="post-card" *ngFor="let post of samplePosts">
                            <mat-card-header>
                                <img *ngIf="profile?.profileImage" 
                                     [src]="profile.profileImage" 
                                     [alt]="profile.firstName"
                                     mat-card-avatar 
                                     class="post-avatar">
                                <div *ngIf="!profile?.profileImage" class="avatar-icon-container" mat-card-avatar>
                                    <mat-icon>account_circle</mat-icon>
                                </div>
                                <mat-card-title>{{ profile.firstName }} {{ profile.lastName }}</mat-card-title>
                                <mat-card-subtitle>{{ post.time }}</mat-card-subtitle>
                                <button mat-icon-button class="more-options">
                                    <mat-icon>more_horiz</mat-icon>
                                </button>
                            </mat-card-header>
                            <mat-card-content>
                                <p [innerHTML]="post.content"></p>
                                <div class="post-image" *ngIf="post.image">
                                    <img [src]="post.image" [alt]="post.imageAlt">
                                </div>
                            </mat-card-content>
                            <div class="post-stats">
                                <span class="stat">
                                    <mat-icon class="liked">thumb_up</mat-icon>
                                    {{ post.likes }}
                                </span>
                                <span class="stat">
                                    {{ post.comments }} comments
                                </span>
                                <span class="stat">
                                    {{ post.shares }} shares
                                </span>
                            </div>
                            <mat-divider></mat-divider>
                            <mat-card-actions>
                                <button mat-button [class.active]="post.isLiked" (click)="post.isLiked = !post.isLiked">
                                    <mat-icon>{{ post.isLiked ? 'thumb_up' : 'thumb_up_off_alt' }}</mat-icon>
                                    Like
                                </button>
                                <button mat-button>
                                    <mat-icon>comment</mat-icon>
                                    Comment
                                </button>
                                <button mat-button>
                                    <mat-icon>share</mat-icon>
                                    Share
                                </button>
                            </mat-card-actions>
                        </mat-card>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .social-profile-container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: #f0f2f5;
            min-height: 100vh;
        }

        .cover-image {
            height: 350px;
            width: 100%;
            overflow: hidden;
            position: relative;
            background-color: white;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .default-cover {
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1da1f2 0%, #0d8bd9 100%);
            }
        }

        .profile-nav {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 0 20px;

            .nav-links {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                gap: 8px;
            }

            .nav-item {
                padding: 16px 24px;
                color: #65676b;
                font-weight: 600;
                border-radius: 0;
                position: relative;
                min-width: 100px;

                .count {
                    font-size: 13px;
                    margin-left: 4px;
                    color: #65676b;
                }

                &.active {
                    color: #1877f2;

                    &::after {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 3px;
                        background-color: #1877f2;
                        border-radius: 3px 3px 0 0;
                    }
                }

                &:hover {
                    background-color: rgba(0, 0, 0, 0.05);
                }
            }
        }

        .content-layout {
            display: grid;
            grid-template-columns: 360px 1fr;
            gap: 24px;
            padding: 20px;
            margin-top: -60px;
            position: relative;
            z-index: 1;
        }

        .sidebar {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .profile-card {
            border-radius: 8px;
            background: white;
            overflow: visible;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .profile-header {
            padding: 20px;
        }

        .profile-image-container {
            margin-top: -120px;
            margin-bottom: 16px;
            position: relative;
            width: 168px;
            height: 168px;

            .profile-image {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                border: 4px solid white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                background-color: white;
                object-fit: cover;
            }

            .default-avatar {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                border: 4px solid white;
                background-color: #f0f2f5;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

                mat-icon {
                    width: 80%;
                    height: 80%;
                    font-size: 134px;
                    color: #bdbdbd;
                }
            }

            .edit-photo-btn {
                position: absolute;
                right: 8px;
                bottom: 8px;
                background-color: #fff;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

                mat-icon {
                    color: #1877f2;
                }
            }
        }

        .profile-info {
            .name-section {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 12px;

                .name-container {
                    h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                        color: #1c1e21;
                        line-height: 1.2;
                    }

                    .username {
                        color: #65676b;
                        font-size: 15px;
                        margin-left: 2px;
                    }
                }
            }

            .bio {
                margin: 16px 0;
                font-size: 15px;
                line-height: 1.5;
                color: #65676b;
            }

            .location-info {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #65676b;
                margin: 12px 0;

                mat-icon {
                    font-size: 20px;
                    width: 20px;
                    height: 20px;
                }
            }
        }

        .stats-section {
            display: flex;
            gap: 16px;
            margin: 20px 0;

            .stat-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 8px 16px;
                border-radius: 8px;

                &:hover {
                    background-color: #f0f2f5;
                }

                .count {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1c1e21;
                    line-height: 1;
                }

                .label {
                    color: #65676b;
                    font-size: 13px;
                    margin-top: 4px;
                }
            }
        }

        .action-buttons {
            display: flex;
            gap: 12px;
            margin-top: 16px;

            .follow-btn {
                flex: 1;
            }

            button {
                mat-icon {
                    margin-right: 8px;
                    font-size: 20px;
                }
            }
        }

        .social-links-card {
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

            mat-card-header {
                padding: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                
                mat-card-title {
                    font-size: 17px;
                    font-weight: 600;
                    margin: 0;
                }
            }

            .social-link {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                transition: background-color 0.2s;
                border-radius: 8px;
                
                &:hover {
                    background-color: #f0f2f5;
                }

                mat-icon {
                    color: #65676b;
                }

                a {
                    color: #1877f2;
                    text-decoration: none;
                    font-size: 15px;
                    flex: 1;

                    &:hover {
                        text-decoration: underline;
                    }
                }
            }

            .add-social {
                padding: 16px;
                text-align: center;

                button {
                    width: 100%;
                }
            }
        }

        .photos-card {
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

            mat-card-header {
                padding: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;

                mat-card-title {
                    font-size: 17px;
                    font-weight: 600;
                    margin: 0;
                }
            }

            .photos-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 4px;
                padding: 0 16px 16px;

                .photo-item {
                    aspect-ratio: 1;
                    border-radius: 8px;
                    overflow: hidden;

                    .photo-placeholder {
                        width: 100%;
                        height: 100%;
                        background-color: #f0f2f5;
                    }
                }
            }
        }

        .main-content {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .create-post-card {
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

            .post-input {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;

                .avatar-image {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                }

                .avatar-icon-container {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background-color: #f0f2f5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(0, 0, 0, 0.1);

                    mat-icon {
                        font-size: 32px;
                        width: 32px;
                        height: 32px;
                        color: #bdbdbd;
                    }
                }

                .post-button {
                    flex: 1;
                    text-align: left;
                    background-color: #f0f2f5;
                    border-radius: 20px;
                    color: #65676b;
                    height: 40px;
                    padding: 8px 16px;
                    font-size: 15px;
                }
            }

            .post-actions {
                display: flex;
                justify-content: space-around;
                padding: 8px;

                button {
                    flex: 1;
                    color: #65676b;
                    height: 36px;

                    mat-icon {
                        margin-right: 8px;
                        font-size: 20px;
                    }
                }
            }
        }

        .post-card {
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

            mat-card-header {
                padding: 12px 16px;
                align-items: center;

                .post-avatar {
                    width: 40px !important;
                    height: 40px !important;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                }

                mat-card-title {
                    font-size: 15px;
                    font-weight: 600;
                    margin: 0;
                    line-height: 1.2;
                }

                mat-card-subtitle {
                    font-size: 13px;
                    margin: 4px 0 0;
                }

                .more-options {
                    margin-left: auto;
                    color: #65676b;
                }
            }

            mat-card-content {
                padding: 0 16px 16px;
                font-size: 15px;
                color: #1c1e21;
                line-height: 1.5;

                .post-image {
                    margin: 12px -16px 0;

                    img {
                        width: 100%;
                        max-height: 500px;
                        object-fit: cover;
                    }
                }
            }

            .post-stats {
                padding: 0 16px 12px;
                display: flex;
                justify-content: space-between;
                color: #65676b;
                font-size: 13px;

                .stat {
                    display: flex;
                    align-items: center;
                    gap: 4px;

                    mat-icon {
                        font-size: 16px;
                        width: 16px;
                        height: 16px;

                        &.liked {
                            color: #1877f2;
                        }
                    }
                }
            }

            mat-card-actions {
                display: flex;
                justify-content: space-between;
                padding: 4px 8px;
                margin: 0;

                button {
                    flex: 1;
                    color: #65676b;
                    height: 36px;
                    border-radius: 8px;

                    &.active {
                        color: #1877f2;
                    }

                    mat-icon {
                        margin-right: 8px;
                        font-size: 20px;
                    }

                    &:hover {
                        background-color: #f0f2f5;
                    }
                }
            }
        }

        .avatar-icon-container {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #f0f2f5;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(0, 0, 0, 0.1);

            mat-icon {
                font-size: 32px;
                width: 32px;
                height: 32px;
                color: #bdbdbd;
            }
        }
    `]
})
export class NewSocialMediaViewComponent implements OnInit {
    @Input() profile!: Account;
    @Input() isOwnProfile = false;
    activeTab: 'posts' | 'about' | 'photos' | 'friends' = 'posts';
    imageError = false;
    loading = false;
    error = '';

    samplePosts = [
        {
            time: '2 hours ago',
            content: 'Just launched my new portfolio website! Check it out and let me know what you think. 🚀',
            likes: 24,
            comments: 5,
            shares: 2,
            isLiked: false
        },
        {
            time: '5 hours ago',
            content: 'Working on some exciting new features for our latest project. Can\'t wait to share more details! 💻',
            image: 'https://source.unsplash.com/random/800x400?coding',
            imageAlt: 'Coding workspace',
            likes: 42,
            comments: 8,
            shares: 3,
            isLiked: true
        },
        {
            time: '1 day ago',
            content: 'Great meeting with the team today! Making progress on our goals. 🎯',
            likes: 18,
            comments: 3,
            shares: 1,
            isLiked: false
        }
    ];

    ngOnInit() {
        console.log('Profile loaded:', this.profile);
    }

    getImageUrl(imagePath: string | undefined): string {
        if (!imagePath) return '';
        
        // If it's already a full URL, return as is
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        // If it's a path starting with /uploads, append to API URL
        if (imagePath.startsWith('/uploads/')) {
            return `${environment.apiUrl}${imagePath}`;
        }
        
        // Legacy format - ensure it's in the profiles directory
        return `${environment.apiUrl}/uploads/profiles/${imagePath}`;
    }

    onImageError(event: any) {
        console.error('Error loading image:', event);
        this.imageError = true;
        if (event.target) {
            event.target.style.display = 'none';
        }
    }

    formatUrl(url: string | undefined): string {
        if (!url) return '';
        return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    }

    get hasSocialLinks(): boolean {
        return !!(this.profile?.website || this.profile?.github || 
                 this.profile?.linkedin || this.profile?.twitter);
    }

    useTemplate(): void {
        this.loading = true;
        // Assume AccountService and ProfileTemplateService are available via DI
        const currentUser = (window as any).accountService?.accountValue || this.profile;
        if (currentUser?.id && (window as any).accountService) {
            (window as any).accountService.update(currentUser.id, { profileTemplateType: 'SOCIAL_MEDIA' })
                .pipe((window as any).first())
                .subscribe({
                    next: () => {
                        (window as any).profileTemplateService.setTemplate('SOCIAL_MEDIA', true);
                        (window as any).router.navigate(['/profile'], { queryParams: { template: 'social-media' } });
                    },
                    error: (error: any) => {
                        console.error('Error updating template:', error);
                        this.error = 'Failed to update template';
                        this.loading = false;
                    }
                });
        } else {
            // If no user ID, just set the template and navigate
            (window as any).profileTemplateService.setTemplate('SOCIAL_MEDIA');
            (window as any).router.navigate(['/profile'], { queryParams: { template: 'social-media' } });
        }
    }
} 