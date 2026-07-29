// src/navigation/ProfileStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import SavedDiscussionsScreen from '../screens/Profile/SavedDiscussionsScreen';
import AnonymousActivityScreen from '../screens/Profile/AnonymousActivityScreen';
import TopicDetailScreen from '../screens/TopicDetail/TopicDetailScreen';

const Stack = createNativeStackNavigator();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="SavedDiscussions" component={SavedDiscussionsScreen} />
      <Stack.Screen name="AnonymousActivity" component={AnonymousActivityScreen} />
      <Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
    </Stack.Navigator>
  );
}
