// src/screens/Splash/SplashScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useRef } from "react";
import { Alert, Animated, Easing, StyleSheet, View } from "react-native";
import { theme } from "../../theme";

import { getAuthState } from "../../store/authStore";

export default function SplashScreen({ navigation }: any) {
  // Logo: starts small + transparent, springs up to full size
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Soft pulse ring behind the logo, loops continuously
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.35)).current;

  // Wordmark + tagline slide up and fade in after the logo lands
  const textTranslateY = useRef(new Animated.Value(14)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  const checkAppInitialization = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please check your internet settings and try again.",
          [{ text: "Retry", onPress: checkAppInitialization }]
        );
        return;
      }

      const hasSeenOnboarding = await AsyncStorage.getItem("HAS_SEEN_ONBOARDING");
      if (!hasSeenOnboarding) {
        navigation.replace("Onboarding");
        return;
      }

      await getAuthState().initialize();
      const { isAuthenticated, isGuest } = getAuthState();

      if (isAuthenticated || isGuest) {
        navigation.reset({
          index: 0,
          routes: [{ name: "MainTabs" }],
        });
      } else {
        navigation.replace("AuthHome");
      }
    } catch (error) {
      console.error("Initialization error:", error);
      navigation.replace("AuthHome");
    }
  };

  useEffect(() => {
    const entrance = Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
    ]);

    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.35,
            duration: 1400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.35,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    entrance.start();
    pulse.start();

    const timer = setTimeout(() => {
      checkAppInitialization();
    }, 2200);

    return () => {
      clearTimeout(timer);
      entrance.stop();
      pulse.stop();
    };
  }, [navigation]);

  return (
    <LinearGradient
      colors={[
        theme.colors.teal800,
        theme.colors.teal600,
        theme.colors.primary600,
      ]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.container}
    >
      <View style={styles.logoWrapper}>
        <Animated.View
          style={[
            styles.pulseRing,
            { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.logoCircle,
            { transform: [{ scale: logoScale }], opacity: logoOpacity },
          ]}
        >
          <Ionicons
            name="shield-checkmark"
            size={38}
            color={theme.colors.white}
          />
          <View style={styles.micBadge}>
            <Ionicons name="mic" size={14} color={theme.colors.teal800} />
          </View>
        </Animated.View>
      </View>

      <Animated.Text
        style={[
          styles.title,
          { opacity: textOpacity, transform: [{ translateY: textTranslateY }] },
        ]}
      >
        SafeVoice
      </Animated.Text>

      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Speak freely. Stay protected.
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xl,
  },
  pulseRing: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  micBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.teal600,
  },
  title: {
    fontSize: 30,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: theme.fontSize.sm,
    color: "rgba(255,255,255,0.85)",
    marginTop: 8,
    letterSpacing: 0.3,
  },
});
