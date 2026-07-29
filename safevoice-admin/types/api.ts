export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export type UserDTO = {
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
};

export type TopicCategory = 'CIVIC' | 'SAFETY' | 'EDUCATION' | 'COMMUNITY' | 'GENERAL' | 'POLLS';
export type TopicStatus = 'ACTIVE' | 'LOCKED' | 'HIDDEN' | 'DELETED';
export type MediaType = 'IMAGE' | 'VIDEO';

export type PollOptionDTO = {
  id: string;
  optionOrder: number;
  label: string;
  votes: number;
  percentage?: number;
};

export type PollDTO = {
  id: string;
  topicId: string | null;
  question: string;
  isMultipleChoice: boolean;
  totalVotes: number;
  status: 'OPEN' | 'CLOSED';
  closesAt: string | null;
  options: PollOptionDTO[];
  mediaUrl?: string | null;
  userVotedOptionIds?: string[];
  createdAt?: string;
};

export type TopicDTO = {
  id: string;
  category: TopicCategory;
  title: string;
  description: string;
  author: UserDTO | null;
  authorNickname: string;
  isAnonymous: boolean;
  mediaUrl: string | null;
  mediaType: MediaType | null;
  likes: number;
  dislikes: number;
  commentCount: number;
  views: number;
  hasPoll: boolean;
  poll?: PollDTO | null;
  isTrending: boolean;
  status: TopicStatus;
  createdAt: string;
  updatedAt?: string;
};

export type ReportTargetType = 'TOPIC' | 'COMMENT' | 'USER';
export type ReportReason = 'SPAM' | 'HARASSMENT' | 'MISINFORMATION' | 'HATE_SPEECH' | 'OTHER';
export type ReportStatus = 'PENDING' | 'APPROVED' | 'DISMISSED';

export type ReportDTO = {
  id: string;
  reporterId: string | null;
  reporterNickname?: string;
  targetType: ReportTargetType;
  targetTopicId: string | null;
  targetCommentId: string | null;
  targetUserId: string | null;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  reviewerId?: string | null;
  reviewerNotes?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
};

export type AuditLogDTO = {
  id: string;
  actorId: string | null;
  actorNickname?: string;
  action: string;
  targetType: string;
  targetId: string;
  detailsJson: any;
  ipAddress: string | null;
  createdAt: string;
};

export type SystemMetricsDTO = {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  totalTopics: number;
  activeTopics: number;
  totalComments: number;
  totalPolls: number;
  totalPollVotes: number;
  pendingReports: number;
  resolvedReportsLast30Days: number;
  newUsersLast7Days: number;
  newTopicsLast7Days: number;
};

export type AuthResponseDTO = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
  user: UserDTO;
};

export type GlobalNotificationType = 'NEW_TOPIC' | 'NEW_POLL' | 'SYSTEM_ANNOUNCEMENT';

export type GlobalNotificationDTO = {
  id: string;
  type: GlobalNotificationType;
  title: string;
  body: string;
  relatedTopicId?: string | null;
  createdAt: string;
};

export type PaginatedResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};
