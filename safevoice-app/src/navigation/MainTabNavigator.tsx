// src/navigation/MainTabNavigator.tsx
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, Text, View } from "react-native";
import { useNotificationStore } from "../store/notificationStore";
import NotificationsScreen from "../screens/Notifications/NotificationsScreen";
import SearchScreen from "../screens/Search/SearchScreen";
import { theme } from "../theme";
import HomeStackNavigator from "./HomeStackNavigator";
import PollsStackNavigator from "./PollsStackNavigator";
import ProfileStackNavigator from "./ProfileStackNavigator";

const Tab = createBottomTabNavigator();
const iconMap: Record<
  string,
  {
    active: keyof typeof Ionicons.glyphMap;
    inactive: keyof typeof Ionicons.glyphMap;
  }
> = {
  Home: { active: "home", inactive: "home-outline" },
  SearchTab: { active: "search", inactive: "search-outline" },
  PollsTab: { active: "stats-chart", inactive: "stats-chart-outline" },
  NotificationsTab: {
    active: "notifications",
    inactive: "notifications-outline",
  },
  ProfileTab: { active: "person", inactive: "person-outline" },
};

export default function MainTabNavigator() {
  const { unreadCount } = useNotificationStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.structure,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = iconMap[route.name];
          if (!icons) return null;
          return (
            <View>
              <Ionicons
                name={focused ? icons.active : icons.inactive}
                size={size}
                color={color}
              />
              {route.name === "NotificationsTab" && unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{ title: "Search" }}
      />
      <Tab.Screen
        name="PollsTab"
        component={PollsStackNavigator}
        options={{ title: "Polls" }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{ title: "Alerts" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.backgroundPrimary,
    borderTopColor: theme.borderDefault,
    height: 58,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: theme.fontWeight.medium,
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -8,
    backgroundColor: theme.brandPrimary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: theme.textOnPrimary,
    fontSize: 9,
    fontWeight: theme.fontWeight.semibold,
  },
});
