// src/screens/Profile/ProfileScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Avatar from "../../components/Avatar";
import { theme } from "../../theme";
import { useAuth, getAuthState } from "../../hooks/useAuth";

function memberSinceLabel(iso?: string): string {
  if (!iso) return "Recently";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

const menuSections = [
  {
    title: "My content",
    items: [
      {
        label: "Saved discussions",
        icon: "bookmark-outline" as const,
        screen: "SavedDiscussions",
        tint: "rgba(20,184,166,0.10)",
        color: theme.colors.teal600,
      },
      {
        label: "Anonymous activity",
        icon: "eye-off-outline" as const,
        screen: "AnonymousActivity",
        tint: "rgba(99,102,241,0.10)",
        color: theme.brandPrimaryText,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Settings",
        icon: "settings-outline" as const,
        screen: null,
        tint: "rgba(100,116,139,0.10)",
        color: theme.textSecondary,
      },
      {
        label: "Help & support",
        icon: "help-circle-outline" as const,
        screen: null,
        tint: "rgba(59,130,246,0.10)",
        color: theme.infoText,
      },
    ],
  },
];

export default function ProfileScreen({ navigation }: any) {
  const { user: authUser } = useAuth();

  const handleLogout = async () => {
    try {
      await getAuthState().logout();
      navigation.reset({
        index: 0,
        routes: [{ name: "AuthFlow" }],
      });
    } catch (error: any) {
      Alert.alert("Logout Error", error.message);
    }
  };

  const user = {
    nickname: authUser?.nickname || "Citizen",
    stats: {
      commentsCount: authUser?.commentsCount ?? 0,
      likesReceived: authUser?.likesReceived ?? 0,
      pollVotesCount: authUser?.pollVotesCount ?? 0,
      memberSince: authUser?.createdAt || new Date().toISOString(),
    },
  };
  const nickname = user.nickname;
  const initials = nickname.substring(0, 2).toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Profile hero ── */}
      <View style={styles.heroWrapper}>
        <LinearGradient
          colors={[theme.colors.teal800, theme.colors.teal600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBg}
        />

        {/* Edit button */}
        <TouchableOpacity style={styles.editButton} activeOpacity={0.78}>
          <Ionicons
            name="pencil-outline"
            size={15}
            color={theme.colors.white}
          />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>

        {/* Avatar */}
        <View style={styles.avatarRing}>
          <Avatar
            initials={initials}
            color={theme.brandPrimaryLight}
            size={72}
          />
        </View>

        <Text style={styles.nickname}>{nickname}</Text>

        <View style={styles.memberBadge}>
          <Ionicons
            name="calendar-outline"
            size={11}
            color="rgba(255,255,255,0.75)"
          />
          <Text style={styles.memberSince}>
            Member since {memberSinceLabel(user.stats.memberSince)}
          </Text>
        </View>

        {/* Anonymous mode pill */}
        <View style={styles.anonPill}>
          <Ionicons
            name="shield-checkmark"
            size={12}
            color={theme.colors.teal600}
          />
          <Text style={styles.anonPillText}>Anonymous mode available</Text>
        </View>
      </View>

      {/* ── Stats strip ── */}
      <View style={styles.statsStrip}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.stats.commentsCount}</Text>
          <Text style={styles.statLabel}>Comments</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.stats.likesReceived}</Text>
          <Text style={styles.statLabel}>Likes received</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.stats.pollVotesCount}</Text>
          <Text style={styles.statLabel}>Poll votes</Text>
        </View>
      </View>

      {/* ── Menu sections ── */}
      {menuSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.menuCard}>
            {section.items.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.menuRow,
                  i < section.items.length - 1 && styles.menuRowBorder,
                ]}
                activeOpacity={0.78}
                onPress={() => item.screen && navigation.navigate(item.screen)}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.tint }]}>
                  <Ionicons name={item.icon} size={17} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.textTertiary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* ── Log out ── */}
      <TouchableOpacity 
        style={styles.logoutButton} 
        activeOpacity={0.78}
        onPress={handleLogout}
      >
        <View style={styles.menuIcon} pointerEvents="none">
          <Ionicons
            name="log-out-outline"
            size={17}
            color={theme.disagreeText}
          />
        </View>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      {/* ── App version ── */}
      <Text style={styles.version}>SafeVoice · v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundSecondary,
  },
  content: {
    paddingBottom: 40,
  },

  // ── Hero ──
  heroWrapper: {
    alignItems: "center",
    paddingBottom: theme.spacing.xl,
    overflow: "hidden",
  },
  heroBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  editButton: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  editText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.white,
  },
  avatarRing: {
    marginTop: 48,
    padding: 3,
    borderRadius: 44,
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.teal800,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  nickname: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.textPrimary,
    letterSpacing: -0.3,
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  memberSince: {
    fontSize: theme.fontSize.xs,
    color: theme.textTertiary,
  },
  anonPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: theme.spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.teal50,
    borderWidth: 1,
    borderColor: theme.colors.teal100,
  },
  anonPillText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.teal600,
    fontWeight: "600",
  },

  // ── Stats ──
  statsStrip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.backgroundPrimary,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    shadowColor: theme.colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.teal800,
  },
  statLabel: {
    fontSize: 10,
    color: theme.textTertiary,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: theme.borderDefault,
  },

  // ── Menu ──
  section: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
    color: theme.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: theme.spacing.sm,
    marginLeft: 2,
  },
  menuCard: {
    backgroundColor: theme.backgroundPrimary,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    overflow: "hidden",
    shadowColor: theme.colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.borderDefault,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(100,116,139,0.08)",
  },
  menuLabel: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    fontWeight: "500",
    color: theme.textPrimary,
  },

  // ── Log out ──
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.backgroundPrimary,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.15)",
  },
  logoutText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.disagreeText,
  },

  // ── Version ──
  version: {
    fontSize: 11,
    color: theme.textTertiary,
    textAlign: "center",
    marginTop: theme.spacing.sm,
  },
});
