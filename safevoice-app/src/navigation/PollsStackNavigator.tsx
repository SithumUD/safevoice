// src/navigation/PollsStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PollsListScreen from '../screens/Polls/PollsListScreen';
import TopicDetailScreen from '../screens/TopicDetail/TopicDetailScreen';

const Stack = createNativeStackNavigator();

export default function PollsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PollsList" component={PollsListScreen} />
      <Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
    </Stack.Navigator>
  );
}
