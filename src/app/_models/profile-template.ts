export enum ProfileTemplateType {
    STANDARD = 'standard',
    BUSINESS_CARD = 'business-card',
    SOCIAL_MEDIA = 'social-media'
}

export interface ProfileTemplate {
    id: ProfileTemplateType;
    name: string;
    description: string;
    thumbnailUrl: string;
}

export const PROFILE_TEMPLATES: ProfileTemplate[] = [
    {
        id: ProfileTemplateType.STANDARD,
        name: 'Standard Profile',
        description: 'Basic professional profile layout with user information, location, and social links',
        thumbnailUrl: 'assets/images/profile-templates/standard-thumbnail.png'
    },
    {
        id: ProfileTemplateType.BUSINESS_CARD,
        name: 'Business Card',
        description: 'Professional contact card-style layout with ratings and work information',
        thumbnailUrl: 'assets/images/profile-templates/business-card-thumbnail.png'
    },
    {
        id: ProfileTemplateType.SOCIAL_MEDIA,
        name: 'Social Media',
        description: 'Twitter-inspired layout showing follower counts and connection information',
        thumbnailUrl: 'assets/images/profile-templates/social-media-thumbnail.png'
    }
]; 