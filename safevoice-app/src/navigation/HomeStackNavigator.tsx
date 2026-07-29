// src/navigation/HomeStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeFeedScreen from '../screens/Home/HomeFeedScreen';
import TopicDetailScreen from '../screens/TopicDetail/TopicDetailScreen';
import CreateTopicScreen from '../screens/Home/CreateTopicScreen';
import EditTopicScreen from '../screens/Home/EditTopicScreen';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeFeed" component={HomeFeedScreen} />
      <Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
      <Stack.Screen name="CreateTopic" component={CreateTopicScreen} />
      <Stack.Screen name="EditTopic" component={EditTopicScreen} />
    </Stack.Navigator>
  );
}
