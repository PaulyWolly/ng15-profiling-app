import { Role } from './role';
import { ProfileTemplateType } from './profile-template';

export interface FollowerImage {
    id: string;
    imageUrl: string;
    path?: string;
}

export class Account {
    id?: string;
    title?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: Role;
    jwtToken?: string;
    refreshToken?: string;
    isVerified?: boolean = false;
    profileImage?: string;
    isDeleting?: boolean;
    imagePath?: string;
    profileTemplateType?: ProfileTemplateType;
    // Social media fields
    website?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    // Business card fields
    phone?: string;
    mobile?: string;
    address?: string;
    company?: string;
    position?: string;
    skills?: string[];
    // Additional profile data
    bio?: string;
    followersCount?: number;
    followingCount?: number;
    // Follower images for social media template
    followerImages?: FollowerImage[];
}