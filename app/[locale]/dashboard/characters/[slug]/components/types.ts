export interface Character {
  id: string;
  name: string;
  slug: string;
  characterType: 'cacao' | 'chocolate' | 'farmer' | 'other';
  description: string;
  personality: string;
  abilities: string[];
  motto: string;
  isPublic: boolean;
  isFork: boolean;
  forkedCharacter?: string;
  assets: {
    icon?: string;
    avatar?: string;
    banner?: string;
  };
  stats: {
    viewCount: number;
    likeCount: number;
    forkCount: number;
    storiesCount: number;
    commitsCount: number;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  gitRepo: string;
  gitPath: string;
  lastCommitSha: string;
  lastCommitMessage: string;
  lastCommitDate: string;
}

export interface Commit {
  sha: string;
  message: string;
  author: string;
  email: string;
  date: string;
  diff?: string;
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  content: string;
  contentType: 'markdown' | 'html' | 'plaintext';
  excerpt: string;
  status: 'draft' | 'published' | 'archived';
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  stats?: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
  isLiked?: boolean;
}

export interface Permissions {
  canEdit: boolean;
  canDelete: boolean;
  canFork: boolean;
}

export interface StoryFormData {
  title: string;
  content: string;
  status: 'draft' | 'published';
  isPublic: boolean;
}
