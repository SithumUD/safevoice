// src/screens/Notifications/NotificationsScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../theme";
import { AppNotification } from "../../types/models";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { notificationsService } from "../../services/notificationsService";
import { useNotificationStore } from "../../store/notificationStore";

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  reply: "arrow-undo",
  REPLY: "arrow-undo",
  like_milestone: "thumbs-up",
  LIKE_MILESTONE: "thumbs-up",
  trending: "flame",
  TRENDING: "flame",
  report_resolved: "shield-checkmark",
  REPORT_RESOLVED: "shield-checkmark",
  new_poll: "stats-chart",
  NEW_POLL: "stats-chart",
  new_topic: "document-text",
  NEW_TOPIC: "document-text",
};

const bgMap: Record<string, string> = {
  reply: "rgba(59,130,246,0.10)",
  REPLY: "rgba(59,130,246,0.10)",
  like_milestone: "rgba(34,197,94,0.10)",
  LIKE_MILESTONE: "rgba(34,197,94,0.10)",
  trending: "rgba(245,158,11,0.10)",
  TRENDING: "rgba(245,158,11,0.10)",
  report_resolved: "rgba(20,184,166,0.10)",
  REPORT_RESOLVED: "rgba(20,184,166,0.10)",
  new_poll: "rgba(99,102,241,0.10)",
  NEW_POLL: "rgba(99,102,241,0.10)",
  new_topic: "rgba(139,92,246,0.10)",
  NEW_TOPIC: "rgba(139,92,246,0.10)",
};

const colorMap: Record<string, string> = {
  reply: theme.infoText,
  REPLY: theme.infoText,
  like_milestone: theme.agreeText,
  LIKE_MILESTONE: theme.agreeText,
  trending: theme.trendingText,
  TRENDING: theme.trendingText,
  report_resolved: theme.structureText,
  REPORT_RESOLVED: theme.structureText,
  new_poll: theme.brandPrimaryText,
  NEW_POLL: theme.brandPrimaryText,
  new_topic: theme.colors.teal600,
  NEW_TOPIC: theme.colors.teal600,
};

const typeLabel: Record<string, string> = {
  reply: "Reply",
  REPLY: "Reply",
  like_milestone: "Milestone",
  LIKE_MILESTONE: "Milestone",
  trending: "Trending",
  TRENDING: "Trending",
  report_resolved: "Resolved",
  REPORT_RESOLVED: "Resolved",
  new_poll: "New Poll",
  NEW_POLL: "New Poll",
  new_topic: "New Topic",
  NEW_TOPIC: "New Topic",
};

function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

type SectionHeader = { type: "header"; title: string };
type FlatItem = SectionHeader | (AppNotification & { isGlobal?: boolean });

export default function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<(AppNotification & { isGlobal?: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const notificationStore = useNotificationStore();

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await notificationsService.getNotifications(0, 20);
      const formatted: (AppNotification & { isGlobal?: boolean })[] = res.content.map((n) => ({
        id: n.id,
        type: n.type.toLowerCase() as any,
        title: n.title,
        body: n.body,
        isRead: n.isRead,
        relatedTopicId: n.relatedTopicId || undefined,
        createdAt: n.createdAt,
      }));
      setNotifications(formatted);
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = async (id: string, isGlobal: boolean = false) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    try {
      if (isGlobal) {
        await notificationsService.markGlobalAsRead(id);
      } else {
        await notificationsService.markAsRead(id);
        await notificationStore.markAsRead(id);
      }
    } catch {
      // Ignore
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await notificationsService.markAllAsRead();
      await notificationStore.markAllAsRead();
    } catch {
      // Ignore
    }
  };

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  const flatItems: FlatItem[] = [];
  if (unread.length > 0) {
    flatItems.push({ type: "header", title: "New" });
    unread.forEach((n) => flatItems.push(n));
  }
  if (read.length > 0) {
    flatItems.push({ type: "header", title: "Earlier" });
    read.forEach((n) => flatItems.push(n));
  }

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <LinearGradient
        colors={[theme.colors.teal800, theme.colors.teal600]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.brandRow}>
          <View style={styles.headerMark}>
            <Ionicons
              name="notifications"
              size={14}
              color={theme.colors.white}
            />
          </View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllRead}
            activeOpacity={0.78}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={14}
              color="rgba(255,255,255,0.9)"
            />
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* ── Content ── */}
      {isLoading ? (
        <View style={[styles.emptyContainer, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color={theme.colors.teal600} />
          <Text style={[styles.emptySubtitle, { marginTop: 12 }]}>Loading notifications...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons
              name="notifications-outline"
              size={28}
              color={theme.colors.teal600}
            />
          </View>
          <Text style={styles.emptyTitle}>All caught up</Text>
          <Text style={styles.emptySubtitle}>
            We'll let you know when something happens
          </Text>
        </View>
      ) : (
        <FlatList
          data={flatItems}
          keyExtractor={(item, i) =>
            "type" in item && (item as SectionHeader).type === "header"
              ? `header-${i}`
              : (item as AppNotification).id
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if ("type" in item && (item as SectionHeader).type === "header") {
              const h = item as SectionHeader;
              return (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{h.title}</Text>
                  <View style={styles.sectionLine} />
                </View>
              );
            }

            const n = item as (AppNotification & { isGlobal?: boolean });
            return (
              <TouchableOpacity
                style={[styles.card, !n.isRead && styles.cardUnread]}
                activeOpacity={0.78}
                onPress={() => {
                  markRead(n.id, n.isGlobal);
                  if (n.relatedTopicId) {
                    navigation.navigate("Home", {
                      screen: "TopicDetail",
                      params: { topicId: n.relatedTopicId },
                    });
                  }
                }}
              >
                {!n.isRead && <View style={styles.unreadAccent} />}

                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: bgMap[n.type] },
                  ]}
                >
                  <Ionicons
                    name={iconMap[n.type]}
                    size={17}
                    color={colorMap[n.type]}
                  />
                </View>

                <View style={styles.textBlock}>
                  <View style={styles.titleRow}>
                    <Text style={styles.notifTitle} numberOfLines={1}>
                      {n.title}
                    </Text>
                    <View
                      style={[
                        styles.typePill,
                        { backgroundColor: bgMap[n.type] },
                      ]}
                    >
                      <Text
                        style={[
                          styles.typePillText,
                          { color: colorMap[n.type] },
                        ]}
                      >
                        {typeLabel[n.type]}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.notifBody} numberOfLines={2}>
                    {n.body}
                  </Text>
                  <View style={styles.metaRow}>
                    <Ionicons
                      name="time-outline"
                      size={11}
                      color={theme.textTertiary}
                    />
                    <Text style={styles.notifTime}>{timeAgo(n.createdAt)}</Text>
                    {n.relatedTopicId && (
                      <>
                        <View style={styles.metaDot} />
                        <Text style={styles.viewThread}>View thread</Text>
                        <Ionicons
                          name="chevron-forward"
                          size={11}
                          color={theme.colors.teal600}
                        />
                      </>
                    )}
                  </View>
                </View>

                {!n.isRead && <View style={styles.dot} />}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundSecondary,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    height: 56,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.white,
    letterSpacing: 0.2,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary600,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderWidth: 1.5,
    borderColor: theme.colors.teal800,
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.white,
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  markAllText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },

  // ── List ──
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 32,
    gap: 8,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
    color: theme.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.borderDefault,
  },

  // ── Card ──
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme.backgroundPrimary,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    padding: theme.spacing.md,
    gap: 12,
    overflow: "hidden",
    shadowColor: theme.colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardUnread: {
    borderColor: theme.colors.teal100,
    backgroundColor: theme.colors.teal50,
  },
  unreadAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: theme.colors.teal600,
    borderTopLeftRadius: theme.radius.xl,
    borderBottomLeftRadius: theme.radius.xl,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
    flexWrap: "wrap",
  },
  notifTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.textPrimary,
    flexShrink: 1,
  },
  typePill: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typePillText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  notifBody: {
    fontSize: theme.fontSize.sm,
    color: theme.textSecondary,
    lineHeight: 19,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  notifTime: {
    fontSize: 11,
    color: theme.textTertiary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.borderDefault,
    marginHorizontal: 2,
  },
  viewThread: {
    fontSize: 11,
    color: theme.colors.teal600,
    fontWeight: "600",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.teal600,
    marginTop: 5,
    flexShrink: 0,
  },

  // ── Empty ──
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.teal50,
    borderWidth: 1,
    borderColor: theme.colors.teal100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.textPrimary,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.textTertiary,
    textAlign: "center",
  },
});
