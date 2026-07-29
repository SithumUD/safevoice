// src/types/api.ts
// Standard DTO types for SafeVoice Spring Boot 3 / 4.1.0 Backend

export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface UserResponseDTO {
  id: string;
  email: string;
  nickname: string;
  avatarUrl: string | null;
  bio?: string | null;
  role: UserRole;
  status: UserStatus;
  topicsCount?: number;
  commentsCount?: number;
  likesReceived?: number;
  pollVotesCount?: number;
  createdAt: string;
}

export interface AuthResponseDTO {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
  user: UserResponseDTO;
}

export type TopicCategory = 'CIVIC' | 'SAFETY' | 'EDUCATION' | 'COMMUNITY' | 'GENERAL' | 'POLLS';
export type MediaType = 'IMAGE' | 'VIDEO';
export type TopicStatus = 'ACTIVE' | 'LOCKED' | 'HIDDEN' | 'DELETED';
export type ReactionType = 'LIKE' | 'DISLIKE';

export interface PollOptionDTO {
  id: string;
  optionOrder: number;
  label: string;
  votes: number;
  percentage: number;
}

export interface PollDTO {
  id: string;
  topicId?: string;
  question: string;
  isMultipleChoice: boolean;
  totalVotes: number;
  status: 'OPEN' | 'CLOSED';
  closesAt?: string | null;
  options: PollOptionDTO[];
  userVotedOptionIds?: string[];
}

export interface TopicResponseDTO {
  id: string;
  category: TopicCategory;
  title: string;
  description: string;
  author: UserResponseDTO | null;
  authorNickname: string;
  isAnonymous: boolean;
  mediaUrl?: string | null;
  mediaType?: MediaType | null;
  likes: number;
  dislikes: number;
  commentCount: number;
  views: number;
  hasPoll: boolean;
  poll?: PollDTO | null;
  isTrending: boolean;
  status: TopicStatus;
  myReaction?: ReactionType | null;
  isSavedByMe?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CommentResponseDTO {
  id: string;
  topicId: string;
  parentCommentId: string | null;
  author: UserResponseDTO | null;
  authorNickname: string;
  isAnonymous: boolean;
  anonymousId?: string | null;
  body: string;
  mediaUrl?: string | null;
  mediaType?: MediaType | null;
  likes: number;
  dislikes: number;
  depth: number;
  status: 'ACTIVE' | 'DELETED' | 'FLAGGED';
  myReaction?: ReactionType | null;
  replies: CommentResponseDTO[];
  createdAt: string;
}

export type NotificationType =
  | 'REPLY'
  | 'LIKE_MILESTONE'
  | 'TRENDING'
  | 'REPORT_RESOLVED'
  | 'NEW_POLL'
  | 'NEW_TOPIC';

export interface NotificationResponseDTO {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  relatedTopicId?: string | null;
  createdAt: string;
}

export type GlobalNotificationType = 'NEW_TOPIC' | 'NEW_POLL' | 'SYSTEM_ANNOUNCEMENT';

export interface GlobalNotificationResponseDTO {
  id: string;
  type: GlobalNotificationType;
  title: string;
  body: string;
  isRead?: boolean;
  relatedTopicId?: string | null;
  createdAt: string;
}

export interface PageResponseDTO<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiErrorEnvelope {
  statusCode: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}

export interface AvatarCatalogItem {
  id: string;
  name: string;
  url: string;
}

export interface MediaUploadResponseDTO {
  url: string;
  publicId: string;
  mediaType: MediaType;
  format: string;
  sizeBytes: number;
}

export interface CloudinarySignatureDTO {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  uploadPreset: string;
}
