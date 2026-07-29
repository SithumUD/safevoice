// src/screens/Profile/SavedDiscussionsScreen.tsx
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
import { useEffect, useCallback } from "react";
import { topicsService } from "../../services/topicsService";
import { Topic } from "../../types/models";
import { theme } from "../../theme";
import TopicCard from "../Home/components/TopicCard";

type FilterOption = "all" | "trending" | "polls";

const filterOptions: { key: FilterOption; label: string; icon: string }[] = [
  { key: "all", label: "All", icon: "bookmark-outline" },
  { key: "trending", label: "Trending", icon: "flame-outline" },
  { key: "polls", label: "With poll", icon: "stats-chart-outline" },
];

export default function SavedDiscussionsScreen({ navigation }: any) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [loading, setLoading] = useState(true);
  const [savedTopics, setSavedTopics] = useState<Topic[]>([]);

  const loadSavedTopics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await topicsService.getTopics({ size: 50 });
      const bookmarked: Topic[] = res.content
        .filter((t) => t.isSavedByMe)
        .map((t) => ({
          ...t,
          mediaUrl: t.mediaUrl || undefined,
          authorIsAnonymous: t.isAnonymous,
          isSaved: true,
        }));
      setSavedTopics(bookmarked);
    } catch {
      setSavedTopics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedTopics();
  }, [loadSavedTopics]);

  const filteredTopics = savedTopics.filter((t) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "trending") return t.isTrending;
    if (activeFilter === "polls") return t.hasPoll;
    return true;
  });

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
            <Ionicons name="bookmark" size={14} color={theme.colors.white} />
          </View>
          <Text style={styles.headerTitle}>Saved</Text>
        </View>

        <View style={styles.headerCount}>
          <Text style={styles.headerCountText}>{savedTopics.length}</Text>
        </View>
      </View>

      {/* ── Filter chips ── */}
      {savedTopics.length > 0 && (
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
      )}

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.teal600} />
        </View>
      ) : savedTopics.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons
              name="bookmark-outline"
              size={28}
              color={theme.colors.teal600}
            />
          </View>
          <Text style={styles.emptyTitle}>No saved discussions</Text>
          <Text style={styles.emptySubtitle}>
            Tap the bookmark on any topic to save it here
          </Text>
        </View>
      ) : filteredTopics.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons
              name="filter-outline"
              size={28}
              color={theme.colors.teal600}
            />
          </View>
          <Text style={styles.emptyTitle}>No matches</Text>
          <Text style={styles.emptySubtitle}>
            None of your saved topics match this filter
          </Text>
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={() => setActiveFilter("all")}
          >
            <Text style={styles.clearFilterText}>Show all saved</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredTopics}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <View style={styles.listHeaderLeft}>
                <Ionicons
                  name="bookmark"
                  size={13}
                  color={theme.colors.teal600}
                />
                <Text style={styles.listHeaderText}>
                  {filteredTopics.length}{" "}
                  {filteredTopics.length === 1 ? "discussion" : "discussions"}
                </Text>
              </View>
              <TouchableOpacity style={styles.sortHint} activeOpacity={0.75}>
                <Ionicons
                  name="swap-vertical-outline"
                  size={13}
                  color={theme.textTertiary}
                />
                <Text style={styles.sortHintText}>Recent</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TopicCard
              topic={item}
              onPress={() =>
                navigation.navigate("TopicDetail", { topicId: item.id })
              }
            />
          )}
          ListFooterComponent={
            <View style={styles.endOfFeed}>
              <View style={styles.endLine} />
              <Text style={styles.endText}>All saved discussions</Text>
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

  // ── Filter bar ──
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
