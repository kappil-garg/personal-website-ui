export interface PersonalInfo {
  id?: string;
  name: string;
  tagline: string;
  description: string[];
  profileImage: string;
  email?: string;
  phone?: string;
  location?: string;
  socialLinks?: SocialLinks;
  updatedAt?: string;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}
