// src/screens/Home/components/TopicCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Avatar from "../../../components/Avatar";
import Badge from "../../../components/Badge";
import { theme } from "../../../theme";
import { Topic } from "../../../types/models";

interface TopicCardProps {
  topic: Topic;
  onPress: () => void;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function TopicCard({ topic, onPress }: TopicCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, topic.isTrending && styles.cardTrending]}
      activeOpacity={0.82}
      onPress={onPress}
    >
      {/* Trending accent bar */}
      {topic.isTrending && <View style={styles.trendingAccent} />}

      {/* Top row: category + badges + time */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <Badge label={topic.category} variant="category" />
          {topic.isTrending && (
            <Badge label="Trending" variant="trending" icon="flame" />
          )}
          {topic.hasPoll && (
            <Badge label="Poll" variant="neutral" icon="stats-chart" />
          )}
        </View>
        <Text style={styles.time}>{timeAgo(topic.createdAt)}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {topic.title}
      </Text>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {topic.description}
      </Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Footer */}
      <View style={styles.footer}>
        {/* Author */}
        <View style={styles.authorRow}>
          <Avatar
            initials={
              topic.authorIsAnonymous
                ? "?"
                : topic.authorNickname.slice(0, 2).toUpperCase()
            }
            isAnonymous={topic.authorIsAnonymous}
            size={24}
          />
          <View style={styles.authorMeta}>
            <Text style={styles.authorName} numberOfLines={1}>
              {topic.authorIsAnonymous ? "Anonymous" : topic.authorNickname}
            </Text>
            {topic.authorIsAnonymous && (
              <View style={styles.anonTag}>
                <Ionicons
                  name="eye-off-outline"
                  size={9}
                  color={theme.anonymousText}
                />
                <Text style={styles.anonText}>protected</Text>
              </View>
            )}
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.metrics}>
          <View style={styles.metricItem}>
            <Ionicons name="eye-outline" size={13} color={theme.textTertiary} />
            <Text style={styles.metricText}>{formatCount(topic.views)}</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Ionicons name="thumbs-up-outline" size={13} color={theme.agree} />
            <Text style={[styles.metricText, styles.metricLike]}>
              {formatCount(topic.likes)}
            </Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={13}
              color={theme.textTertiary}
            />
            <Text style={styles.metricText}>
              {formatCount(topic.commentCount)}
            </Text>
          </View>
        </View>
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
    // Soft lift
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

  // Trending left-edge accent bar
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

  // Content
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.textPrimary,
    lineHeight: 22,
    marginBottom: 5,
    letterSpacing: -0.1,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.textSecondary,
    lineHeight: 20,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: theme.borderDefault,
    marginVertical: theme.spacing.md,
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Author
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: theme.fontSize.xs,
    color: theme.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  anonTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 1,
  },
  anonText: {
    fontSize: 10,
    color: theme.anonymousText,
  },

  // Metrics
  metrics: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metricText: {
    fontSize: 12,
    color: theme.textTertiary,
    fontWeight: "500",
  },
  metricLike: {
    color: theme.agree,
  },
  metricDivider: {
    width: 1,
    height: 10,
    backgroundColor: theme.borderDefault,
  },
});
