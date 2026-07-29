// src/types/models.ts

export type SortOption =
  | "latest"
  | "trending"
  | "most_commented"
  | "newest"
  | "most_liked";

export interface User {
  id: string;
  nickname: string;
  avatarColor: string; // used for initials-avatar background
  avatarInitials: string;
  isGuest: boolean;
  stats: {
    commentsCount: number;
    likesReceived: number;
    pollVotesCount: number;
    memberSince: string; // ISO date
  };
}

export interface Topic {
  id: string;
  category: string;
  authorNickname: string;
  authorIsAnonymous: boolean;
  title: string;
  description: string;
  createdAt: string; // ISO date
  views: number;
  likes: number;
  dislikes: number;
  commentCount: number;
  isTrending: boolean;
  hasPoll: boolean;
  pollId?: string;
  mediaUrl?: string;
  isSaved?: boolean;
  userReaction?: 'like' | 'dislike' | null;
}

export interface Comment {
  id: string;
  topicId: string;
  parentCommentId: string | null;
  authorNickname: string;
  isAnonymous: boolean;
  anonymousId?: string;
  body: string;
  mediaUrl?: string | null;
  mediaType?: 'image' | 'video' | null;
  isUploading?: boolean;
  createdAt: string;
  likes: number;
  dislikes: number;
  depth: number;
  replies?: Comment[];
  userReaction?: 'like' | 'dislike' | null;
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export interface Poll {
  id: string;
  topicId?: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  closesAt: string; // ISO date
  userHasVoted: boolean;
  userVotedOptionId?: string;
  createdAt: string;
  topic?: Topic;
}

export interface AppNotification {
  id: string;
  type:
    | "reply"
    | "like_milestone"
    | "trending"
    | "report_resolved"
    | "new_poll"
    | "new_topic";
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  relatedTopicId?: string;
}
