// src/screens/Profile/AnonymousActivityScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { theme } from "../../theme";
import { Comment } from "../../types/models";
import { useAuth } from "../../hooks/useAuth";

function timeAgo(iso: string): string {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AnonymousActivityScreen({ navigation }: any) {
  const { user } = useAuth();
  const [anonymousComments, setAnonymousComments] = useState<Comment[]>([]);

  useEffect(() => {
    // Loaded dynamically via backend comment history or session state
    setAnonymousComments([]);
  }, [user]);

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <LinearGradient
          colors={[theme.colors.teal800, theme.colors.teal600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.white} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerMark}>
            <Ionicons name="eye-off" size={14} color={theme.colors.white} />
          </View>
          <Text style={styles.headerTitle}>Anonymous activity</Text>
        </View>

        <View style={styles.headerCount}>
          <Text style={styles.headerCountText}>{anonymousComments.length}</Text>
        </View>
      </View>

      {/* ── Privacy notice ── */}
      <View style={styles.notice}>
        <View style={styles.noticeIconCircle}>
          <Ionicons
            name="shield-checkmark"
            size={16}
            color={theme.colors.teal600}
          />
        </View>
        <Text style={styles.noticeText}>
          Only you can see this list. Everyone else sees these comments as
          anonymous.
        </Text>
      </View>

      {/* ── Content ── */}
      {anonymousComments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons
              name="eye-off-outline"
              size={28}
              color={theme.colors.teal600}
            />
          </View>
          <Text style={styles.emptyTitle}>No anonymous activity yet</Text>
          <Text style={styles.emptySubtitle}>
            Comments you post anonymously will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={anonymousComments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <View style={styles.listHeaderLeft}>
                <Ionicons
                  name="eye-off"
                  size={13}
                  color={theme.anonymousText}
                />
                <Text style={styles.listHeaderText}>
                  {anonymousComments.length}{" "}
                  {anonymousComments.length === 1 ? "comment" : "comments"}
                </Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Left accent bar */}
              <View style={styles.cardAccent} />

              {/* Card header */}
              <View style={styles.cardHeader}>
                <View style={styles.anonBadge}>
                  <Ionicons
                    name="eye-off"
                    size={11}
                    color={theme.anonymousText}
                  />
                  <Text style={styles.anonId}>
                    {item.anonymousId ?? "anon"}
                  </Text>
                </View>
                <View style={styles.cardHeaderRight}>
                  <Ionicons
                    name="time-outline"
                    size={11}
                    color={theme.textTertiary}
                  />
                  <Text style={styles.timestamp}>
                    {timeAgo(item.createdAt)}
                  </Text>
                </View>
              </View>

              {/* Body */}
              <Text style={styles.body}>{item.body}</Text>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <View style={styles.metricItem}>
                  <Ionicons
                    name="thumbs-up-outline"
                    size={13}
                    color={theme.textTertiary}
                  />
                  <Text style={styles.metricText}>{item.likes}</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Ionicons
                    name="thumbs-down-outline"
                    size={13}
                    color={theme.textTertiary}
                  />
                  <Text style={styles.metricText}>{item.dislikes}</Text>
                </View>
                {item.replies && item.replies.length > 0 && (
                  <>
                    <View style={styles.metricDivider} />
                    <View style={styles.metricItem}>
                      <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={13}
                        color={theme.textTertiary}
                      />
                      <Text style={styles.metricText}>
                        {item.replies.length}{" "}
                        {item.replies.length === 1 ? "reply" : "replies"}
                      </Text>
                    </View>
                  </>
                )}
                <View style={{ flex: 1 }} />
                <View style={styles.protectedPill}>
                  <Ionicons
                    name="shield-checkmark"
                    size={10}
                    color={theme.colors.teal600}
                  />
                  <Text style={styles.protectedText}>protected</Text>
                </View>
              </View>
            </View>
          )}
          ListFooterComponent={
            <View style={styles.endOfFeed}>
              <View style={styles.endLine} />
              <Text style={styles.endText}>All anonymous comments</Text>
              <View style={styles.endLine} />
            </View>
          }
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
    height: 56,
    paddingHorizontal: theme.spacing.md,
    overflow: "hidden",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  headerCenter: {
    flex: 1,
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
  headerCount: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  headerCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.white,
  },

  // ── Privacy notice ──
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: theme.colors.teal50,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.teal100,
  },
  noticeIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.teal100,
    flexShrink: 0,
  },
  noticeText: {
    flex: 1,
    fontSize: theme.fontSize.xs,
    color: theme.colors.teal600,
    lineHeight: 17,
    fontWeight: "500",
  },

  // ── List ──
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 32,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  listHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  listHeaderText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
    color: theme.anonymousText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ── Card ──
  card: {
    backgroundColor: theme.backgroundPrimary,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    overflow: "hidden",
    shadowColor: theme.colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: theme.anonymousText,
    opacity: 0.35,
    borderTopLeftRadius: theme.radius.xl,
    borderBottomLeftRadius: theme.radius.xl,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  anonBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(120,90,170,0.08)",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  anonId: {
    fontSize: theme.fontSize.xs,
    color: theme.anonymousText,
    fontWeight: theme.fontWeight.semibold,
    fontStyle: "italic",
  },
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
    color: theme.textTertiary,
  },

  // Body
  body: {
    fontSize: theme.fontSize.sm,
    color: theme.textPrimary,
    lineHeight: 21,
    marginBottom: 12,
  },

  // Footer
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.borderDefault,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    color: theme.textTertiary,
    fontWeight: "500",
  },
  metricDivider: {
    width: 1,
    height: 10,
    backgroundColor: theme.borderDefault,
  },
  protectedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: theme.colors.teal50,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: theme.colors.teal100,
  },
  protectedText: {
    fontSize: 10,
    color: theme.colors.teal600,
    fontWeight: "600",
  },

  // ── Empty ──
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xxl,
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
    lineHeight: 20,
  },

  // ── End of feed ──
  endOfFeed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
  },
  endLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.borderDefault,
  },
  endText: {
    fontSize: 11,
    color: theme.textTertiary,
  },
});
