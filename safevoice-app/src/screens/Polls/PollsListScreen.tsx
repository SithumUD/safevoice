// src/screens/Polls/PollsListScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Poll } from "../../types/models";
import { theme } from "../../theme";
import PollCard from "./components/PollCard";
import { topicsService } from "../../services/topicsService";
import { pollsService } from "../../services/pollsService";

type FilterOption = "all" | "live" | "closed";

const filterOptions: { key: FilterOption; label: string; icon: string }[] = [
  { key: "all", label: "All polls", icon: "stats-chart-outline" },
  { key: "live", label: "Live", icon: "radio-outline" },
  { key: "closed", label: "Closed", icon: "checkmark-circle-outline" },
];

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function PollsListScreen({ navigation }: any) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      setLoading(true);

      Promise.all([
        pollsService.getPolls(0, 50),
        topicsService.getTopics({ size: 50 }),
      ])
        .then(([pollsRes, topicsRes]) => {
          if (!isMounted) return;

          const topicsMap = new Map(topicsRes.content.map((t) => [t.id, t]));

          const fetchedPolls: Poll[] = pollsRes.content.map((p) => {
            const topic = p.topicId ? topicsMap.get(p.topicId) : undefined;
            return {
              id: p.id,
              topicId: p.topicId || "",
              question: p.question,
              options: (p.options || []).map((o) => ({
                id: o.id,
                label: o.label,
                votes: o.votes,
              })),
              totalVotes: p.totalVotes,
              status: p.status,
              closesAt: p.closesAt || "",
              userHasVoted: (p.userVotedOptionIds?.length ?? 0) > 0,
              userVotedOptionId: p.userVotedOptionIds?.[0],
              createdAt: p.createdAt,
              topic: topic
                ? ({
                    ...topic,
                    authorIsAnonymous: topic.isAnonymous,
                  } as any)
                : undefined,
            };
          });

          setPolls(fetchedPolls);
        })
        .catch((err) => {
          console.warn("Failed to load polls feed:", err);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const isPollLive = (p: Poll) => {
    if (p.closesAt && new Date(p.closesAt).getTime() < Date.now()) {
      return false;
    }
    return true;
  };

  const filteredPolls = polls.filter((p) => {
    if (activeFilter === "all") return true;
    const live = isPollLive(p);
    return activeFilter === "live" ? live : !live;
  });

  const activePollsCount = polls.filter(isPollLive).length;

  const totalVotesAll = polls.reduce((sum, p) => sum + p.totalVotes, 0);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [64, 52],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      {/* ── Animated header ── */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={[theme.colors.teal800, theme.colors.teal600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.brandRow}>
          <View style={styles.headerMark}>
            <Ionicons name="stats-chart" size={14} color={theme.colors.white} />
          </View>
          <Text style={styles.headerTitle}>Polls</Text>
          {/* Live indicator */}
          <View style={styles.liveChip}>
            <View style={styles.liveDot} />
            <Text style={styles.liveChipText}>Live</Text>
          </View>
        </View>
        <View style={styles.headerMeta}>
          <Ionicons
            name="people-outline"
            size={12}
            color="rgba(255,255,255,0.7)"
          />
          <Text style={styles.headerMetaText}>
            {formatCount(totalVotesAll)} total votes
          </Text>
        </View>
      </Animated.View>

      {/* ── Stats strip ── */}
      <View style={styles.statsStrip}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{polls.length}</Text>
          <Text style={styles.statLabel}>Polls</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatCount(totalVotesAll)}</Text>
          <Text style={styles.statLabel}>Votes cast</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.teal600 }]}>
            {activePollsCount}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
      </View>

      {/* ── Filter chips ── */}
      <View style={styles.filterBar}>
        {filterOptions.map((f) => {
          const active = f.key === activeFilter;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.78}
            >
              <Ionicons
                name={f.icon as any}
                size={13}
                color={active ? theme.colors.teal600 : theme.textTertiary}
              />
              <Text
                style={[
                  styles.filterChipText,
                  active && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Poll list ── */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.teal600} />
        </View>
      ) : (
        <Animated.FlatList
          data={filteredPolls}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
          scrollEventThrottle={16}
          ListHeaderComponent={
            filteredPolls.length > 0 ? (
              <View style={styles.listHeader}>
                <View style={styles.listHeaderLeft}>
                  <Ionicons
                    name="stats-chart"
                    size={13}
                    color={theme.colors.teal600}
                  />
                  <Text style={styles.listHeaderText}>
                    {filteredPolls.length}{" "}
                    {filteredPolls.length === 1 ? "poll" : "polls"}
                  </Text>
                </View>
              <TouchableOpacity style={styles.sortHint} activeOpacity={0.75}>
                <Ionicons
                  name="swap-vertical-outline"
                  size={13}
                  color={theme.textTertiary}
                />
                <Text style={styles.sortHintText}>Most voted</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="stats-chart-outline"
                size={28}
                color={theme.colors.teal600}
              />
            </View>
            <Text style={styles.emptyTitle}>No polls here</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === "all"
                ? "No polls have been posted yet"
                : `No ${activeFilter} polls right now`}
            </Text>
            {activeFilter !== "all" && (
              <TouchableOpacity
                style={styles.clearFilterButton}
                onPress={() => setActiveFilter("all")}
              >
                <Text style={styles.clearFilterText}>Show all polls</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <PollCard
            key={item.id}
            poll={item}
            onPress={
              item.topicId
                ? () => navigation.navigate("TopicDetail", { topicId: item.topicId })
                : undefined
            }
          />
        )}
        ListFooterComponent={
          filteredPolls.length > 0 ? (
            <View style={styles.endOfFeed}>
              <View style={styles.endLine} />
              <Text style={styles.endText}>All polls loaded</Text>
              <View style={styles.endLine} />
            </View>
          ) : null
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
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    overflow: "hidden",
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
  liveChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginLeft: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.white,
    opacity: 0.9,
  },
  liveChipText: {
    fontSize: 10,
    color: theme.colors.white,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerMetaText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },

  // ── Stats strip ──
  statsStrip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderDefault,
    paddingVertical: theme.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: theme.textTertiary,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: theme.borderDefault,
  },

  // ── Filter chips ──
  filterBar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderDefault,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    backgroundColor: theme.backgroundSecondary,
  },
  filterChipActive: {
    backgroundColor: theme.colors.teal50,
    borderColor: theme.colors.teal600,
  },
  filterChipText: {
    fontSize: theme.fontSize.xs,
    color: theme.textSecondary,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: theme.colors.teal600,
    fontWeight: "700",
  },

  // ── List ──
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 32,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    color: theme.colors.teal600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sortHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    backgroundColor: theme.backgroundSecondary,
  },
  sortHintText: {
    fontSize: 11,
    color: theme.textTertiary,
    fontWeight: "500",
  },

  // ── Empty ──
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
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
  clearFilterButton: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.teal50,
    borderWidth: 1,
    borderColor: theme.colors.teal100,
  },
  clearFilterText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.teal600,
    fontWeight: "600",
  },

  // ── End of feed ──
  endOfFeed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: theme.spacing.md,
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
