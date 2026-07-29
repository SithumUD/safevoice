// src/navigation/types.ts

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  AuthHome: undefined;
  Login: undefined;
  Signup: undefined;
  MainTabs: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Polls: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeFeed: undefined;
  TopicDetail: { topicId: string };
  CreateTopic: undefined;
  EditTopic: { topicId: string; title: string; description: string; mediaUrl?: string | null; mediaType?: 'IMAGE' | 'VIDEO' | null };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  SavedDiscussions: undefined;
  AnonymousActivity: undefined;
};
