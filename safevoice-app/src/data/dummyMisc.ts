// src/data/dummyMisc.ts
import { Poll, AppNotification, User } from '../types/models';

export const dummyPolls: Record<string, Poll> = {
  p1: {
    id: 'p1',
    topicId: 't1',
    question: 'Should bus fares be subsidized for university students?',
    options: [
      { id: 'o1', label: 'Yes, full subsidy', votes: 412 },
      { id: 'o2', label: 'Yes, but partial / means-tested', votes: 689 },
      { id: 'o3', label: 'No, not a priority right now', votes: 145 },
      { id: 'o4', label: 'Unsure', votes: 58 },
    ],
    totalVotes: 1304,
    closesAt: '2026-06-25T23:59:00Z',
    userHasVoted: false,
    createdAt: '2026-06-01T00:00:00Z',
  },
  p2: {
    id: 'p2',
    topicId: 't3',
    question: 'Are you comfortable with the new digital ID system?',
    options: [
      { id: 'o1', label: 'Yes, makes sense', votes: 891 },
      { id: 'o2', label: 'No, privacy concerns', votes: 1240 },
      { id: 'o3', label: 'Need more information first', votes: 670 },
    ],
    totalVotes: 2801,
    closesAt: '2026-06-22T23:59:00Z',
    userHasVoted: true,
    userVotedOptionId: 'o2',
    createdAt: '2026-06-01T00:00:00Z',
  },
  p3: {
    id: 'p3',
    topicId: 't5',
    question: 'Do you agree with the latest squad selection?',
    options: [
      { id: 'o1', label: 'Yes, good balance', votes: 234 },
      { id: 'o2', label: 'No, key players missing', votes: 456 },
    ],
    totalVotes: 690,
    closesAt: '2026-06-21T23:59:00Z',
    userHasVoted: false,
    createdAt: '2026-06-01T00:00:00Z',
  },
};

export const dummyNotifications: AppNotification[] = [
  {
    id: 'n1',
    type: 'reply',
    title: 'New reply',
    body: 'anon_9183 replied to your comment on "Should public bus fares be subsidized..."',
    createdAt: '2026-06-20T09:16:00Z',
    isRead: false,
    relatedTopicId: 't1',
  },
  {
    id: 'n2',
    type: 'like_milestone',
    title: 'Your comment is getting noticed',
    body: 'Your comment on "Best place for cheese kottu..." passed 100 likes.',
    createdAt: '2026-06-20T07:30:00Z',
    isRead: false,
    relatedTopicId: 't2',
  },
  {
    id: 'n3',
    type: 'trending',
    title: 'Trending now',
    body: '"Thoughts on the new digital ID rollout?" is trending in Politics.',
    createdAt: '2026-06-19T20:00:00Z',
    isRead: true,
    relatedTopicId: 't3',
  },
  {
    id: 'n4',
    type: 'report_resolved',
    title: 'Thanks for keeping LankaVoice safe',
    body: 'Your report was reviewed and the content was actioned. We appreciate you helping moderate the community.',
    createdAt: '2026-06-18T16:00:00Z',
    isRead: true,
  },
  {
    id: 'n5',
    type: 'new_poll',
    title: 'New poll in Sports',
    body: 'A new poll was just posted: "Do you agree with the latest squad selection?"',
    createdAt: '2026-06-20T06:05:00Z',
    isRead: true,
    relatedTopicId: 't5',
  },
];

export const currentUser: User = {
  id: 'u1',
  nickname: 'nadeesha_w',
  avatarColor: '#D85A30',
  avatarInitials: 'NW',
  isGuest: false,
  stats: {
    commentsCount: 142,
    likesReceived: 891,
    pollVotesCount: 37,
    memberSince: '2025-02-14T00:00:00Z',
  },
};

export const guestUser: User = {
  id: 'guest',
  nickname: 'Guest',
  avatarColor: '#888780',
  avatarInitials: 'G',
  isGuest: true,
  stats: {
    commentsCount: 0,
    likesReceived: 0,
    pollVotesCount: 0,
    memberSince: '',
  },
};
