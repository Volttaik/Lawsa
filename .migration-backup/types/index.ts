// Shared type definitions between server and client components

export interface Post {
  _id: string;
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorImage?: string;
  authorIsVerified?: boolean;
  authorEmailVerified?: boolean;
  authorIsSpecial?: boolean;
  content: string;
  images?: string[];
  videos?: string[];
  likes?: string[];
  bookmarks?: string[];
  reactions?: Record<string, string[]>;
  shares?: string[];
  reshares?: number;
  category?: string;
  repostedFrom?: any;
  poll?: any;
  views?: number;
  comments?: any[];
  commentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Me {
  id: string;
  _id?: string;
  name: string;
  username: string;
  email?: string;
  profileImage?: string;
  isVerified?: boolean;
  isSpecial?: boolean;
  emailVerified?: boolean;
  bio?: string;
  headline?: string;
  website?: string;
  location?: string;
  bannerImage?: string;
  followers?: string[];
  following?: string[];
}