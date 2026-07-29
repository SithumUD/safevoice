// src/navigation/RootNavigator.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthNavigator from "./AuthNavigator";
import MainTabNavigator from "./MainTabNavigator";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* AuthNavigator owns Splash -> Onboarding -> AuthHome -> Login/Signup,
            and replaces itself with MainTabs once the user logs in or
            continues as guest (see AuthHomeScreen / LoginScreen / SignupScreen) */}
        <Stack.Screen name="AuthFlow" component={AuthNavigator} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
