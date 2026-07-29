// src/screens/Auth/AuthHomeScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../components/Button";
import { theme } from "../../theme";

const trustFeatures = [
  { icon: "shield-checkmark-outline" as const, label: "Anonymous mode" },
  { icon: "stats-chart-outline" as const, label: "Live polls" },
  { icon: "chatbubbles-outline" as const, label: "Threaded discussion" },
];

export default function AuthHomeScreen({ navigation }: any) {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(16)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const pillsOpacity = useRef(new Animated.Value(0)).current;
  const actionsTranslateY = useRef(new Animated.Value(12)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 340,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 340,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(pillsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(actionsTranslateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(actionsOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.bgArcOuter} pointerEvents="none" />
      <View style={styles.bgArcInner} pointerEvents="none" />

      <View style={styles.logoBlock}>
        <Animated.View
          style={{ transform: [{ scale: logoScale }], opacity: logoOpacity }}
        >
          <LinearGradient
            colors={[theme.colors.teal600, theme.colors.primary600]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoCircle}
          >
            <Ionicons
              name="shield-checkmark"
              size={34}
              color={theme.colors.white}
            />
            <View style={styles.micBadge}>
              <Ionicons name="mic" size={12} color={theme.colors.teal800} />
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={{
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
            alignItems: "center",
          }}
        >
          <Text style={styles.appName}>SafeVoice</Text>
          <Text style={styles.title}>Speak up. Stay protected.</Text>
          <Text style={styles.subtitle}>
            Sri Lanka's community for honest discussion — debate, vote, and
            comment anonymously when it matters most.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.pillsRow, { opacity: pillsOpacity }]}>
          {trustFeatures.map((f) => (
            <View key={f.label} style={styles.pill}>
              <Ionicons
                name={f.icon}
                size={14}
                color={theme.colors.teal600}
                style={{ marginRight: 5 }}
              />
              <Text style={styles.pillText}>{f.label}</Text>
            </View>
          ))}
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.actionsCard,
          {
            opacity: actionsOpacity,
            transform: [{ translateY: actionsTranslateY }],
          },
        ]}
      >
        <Button
          label="Create account"
          onPress={() => navigation.navigate("Signup")}
        />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          label="Log in"
          variant="outline"
          onPress={() => navigation.navigate("Login")}
        />

        <TouchableOpacity
          style={styles.guestButton}
          onPress={() => navigation.getParent()?.replace("MainTabs")}
        >
          <Text style={styles.guestText}>Continue as guest</Text>
          <Ionicons
            name="chevron-forward"
            size={13}
            color={theme.textTertiary}
          />
        </TouchableOpacity>

        <Text style={styles.legalText}>
          By continuing you agree to our{" "}
          <Text style={styles.legalLink}>Terms</Text> and{" "}
          <Text style={styles.legalLink}>Community Guidelines</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundPrimary,
    justifyContent: "space-between",
    paddingBottom: theme.spacing.xxl,
  },
  bgArcOuter: {
    position: "absolute",
    top: -160,
    alignSelf: "center",
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: theme.colors.teal50,
    opacity: 0.55,
  },
  bgArcInner: {
    position: "absolute",
    top: -200,
    alignSelf: "center",
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: theme.colors.teal100,
    opacity: 0.25,
  },
  logoBlock: {
    alignItems: "center",
    paddingTop: 72,
    paddingHorizontal: theme.spacing.xl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xl,
    shadowColor: theme.colors.teal800,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },
  micBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.teal600,
  },
  appName: {
    fontSize: 13,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.teal600,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.textPrimary,
    textAlign: "center",
    lineHeight: 34,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.textSecondary,
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.teal50,
    borderWidth: 1,
    borderColor: theme.colors.teal100,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.teal600,
    fontWeight: theme.fontWeight.medium,
  },
  actionsCard: {
    marginHorizontal: theme.spacing.xl,
    backgroundColor: theme.backgroundPrimary,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    padding: theme.spacing.xl,
    shadowColor: theme.colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.md,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.borderDefault,
  },
  dividerText: {
    fontSize: theme.fontSize.xs,
    color: theme.textTertiary,
  },
  guestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: theme.spacing.md,
    marginTop: 4,
  },
  guestText: {
    fontSize: theme.fontSize.sm,
    color: theme.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  legalText: {
    fontSize: 11,
    color: theme.textTertiary,
    textAlign: "center",
    marginTop: theme.spacing.md,
    lineHeight: 16,
  },
  legalLink: {
    color: theme.colors.teal600,
  },
});
