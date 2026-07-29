// src/screens/Polls/components/PollCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Badge from "../../../components/Badge";
import { theme } from "../../../theme";
import { Poll } from "../../../types/models";
import PollResultsBar from "./PollResultsBar";

interface PollCardProps {
  poll: Poll;
  onPress?: () => void;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function timeAgo(iso: string): string {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function PollCard({ poll, onPress }: PollCardProps) {
  const { topic } = poll;
  
  const totalVotes =
    poll?.options?.reduce((sum: number, o: any) => sum + (o.votes ?? 0), 0) ??
    0;
  const isLive = !poll?.closesAt || new Date(poll.closesAt).getTime() > Date.now();

  const displayCategory = topic?.category || "Poll";
  const isTrending = topic?.isTrending || false;
  const displayTime = topic ? timeAgo(topic.createdAt) : timeAgo(poll.createdAt);
  const displayTitle = topic?.title || poll.question;

  return (
    <TouchableOpacity
      style={[styles.card, isTrending && styles.cardTrending]}
      onPress={onPress}
      activeOpacity={onPress ? 0.82 : 1}
      disabled={!onPress}
    >
      {/* Trending accent bar */}
      {isTrending && <View style={styles.trendingAccent} />}

      {/* ── Top row: badges + time ── */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <Badge label={displayCategory} variant="category" />
          {isTrending && (
            <Badge label="Trending" variant="trending" icon="flame" />
          )}
        </View>
        <Text style={styles.time}>{displayTime}</Text>
      </View>

      {/* ── Title ── */}
      <Text style={styles.title} numberOfLines={2}>
        {displayTitle}
      </Text>

      {/* ── Poll meta row ── */}
      <View style={styles.pollMeta}>
        <View style={styles.pollLabel}>
          <Ionicons name="stats-chart" size={12} color={theme.colors.teal600} />
          <Text style={styles.pollLabelText}>Community Poll</Text>
        </View>
        {/* Live / Closed indicator */}
        <View
          style={[
            styles.statusChip,
            isLive ? styles.statusLive : styles.statusClosed,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              isLive ? styles.statusDotLive : styles.statusDotClosed,
            ]}
          />
          <Text
            style={[
              styles.statusText,
              isLive ? styles.statusTextLive : styles.statusTextClosed,
            ]}
          >
            {isLive ? "Live" : "Closed"}
          </Text>
        </View>
      </View>

      {/* ── Poll results bar ── */}
      <View style={styles.pollResults}>
        <PollResultsBar poll={poll} />
      </View>

      {/* ── Footer: votes + comments ── */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <View style={styles.metricItem}>
            <Ionicons
              name="people-outline"
              size={13}
              color={theme.textTertiary}
            />
            <Text style={styles.metricText}>
              {formatCount(totalVotes)} votes
            </Text>
          </View>
          {topic && (
            <>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={13}
                  color={theme.textTertiary}
                />
                <Text style={styles.metricText}>
                  {formatCount(topic.commentCount)} comments
                </Text>
              </View>
            </>
          )}
        </View>

        {topic && (
          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View discussion</Text>
            <Ionicons
              name="chevron-forward"
              size={13}
              color={theme.colors.teal600}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.backgroundPrimary,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    overflow: "hidden",
    shadowColor: theme.colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTrending: {
    borderColor: theme.colors.amber100,
    backgroundColor: "#FFFDF8",
    shadowColor: theme.colors.amber400,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  trendingAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: theme.colors.amber200,
    borderTopLeftRadius: theme.radius.xl,
    borderBottomLeftRadius: theme.radius.xl,
  },

  // Top row
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 11,
    color: theme.textTertiary,
    marginTop: 2,
    flexShrink: 0,
  },

  // Title
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.textPrimary,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
    letterSpacing: -0.1,
  },

  // Poll meta
  pollMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  pollLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  pollLabelText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
    color: theme.colors.teal600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusLive: {
    backgroundColor: "rgba(239,68,68,0.08)",
  },
  statusClosed: {
    backgroundColor: theme.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.borderDefault,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotLive: {
    backgroundColor: theme.disagree,
  },
  statusDotClosed: {
    backgroundColor: theme.textTertiary,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statusTextLive: {
    color: theme.disagree,
  },
  statusTextClosed: {
    color: theme.textTertiary,
  },

  // Poll results
  pollResults: {
    marginBottom: theme.spacing.md,
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.borderDefault,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.teal100,
    backgroundColor: theme.colors.teal50,
  },
  viewButtonText: {
    fontSize: 12,
    color: theme.colors.teal600,
    fontWeight: "600",
  },
});
