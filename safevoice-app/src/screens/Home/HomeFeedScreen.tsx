// src/screens/Home/HomeFeedScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../theme";
import { SortOption } from "../../types/models";
import FilterBar from "./components/FilterBar";
import TopicCard from "./components/TopicCard";
import { topicsService } from "../../services/topicsService";
import { getAuthState, subscribeAuth } from "../../store/authStore";
import { useEffect as useEffectHook, useState as useStateHook } from "react";

const HEADER_MAX_HEIGHT = 64;
const HEADER_MIN_HEIGHT = 52;
const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const sortLabels: Record<SortOption, { label: string; icon: string }> = {
  latest: { label: "Latest", icon: "time-outline" },
  trending: { label: "Trending", icon: "flame-outline" },
  most_commented: { label: "Most discussed", icon: "chatbubbles-outline" },
  newest: { label: "Newest", icon: "sparkles-outline" },
  most_liked: { label: "Most liked", icon: "thumbs-up-outline" },
};

const SORT_OPTIONS: SortOption[] = [
  "latest",
  "trending",
  "most_commented",
  "newest",
  "most_liked",
];

export default function HomeFeedScreen({ navigation }: any) {
  const [topics, setTopics] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  // Track auth state for FAB
  const [isAuthenticated, setIsAuthenticated] = useStateHook(
    () => getAuthState().isAuthenticated
  );
  useEffectHook(() => {
    return subscribeAuth(() => {
      setIsAuthenticated(getAuthState().isAuthenticated);
    });
  }, []);

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });
  const titleScale = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [1, 0.85],
    extrapolate: "clamp",
  });

  const loadTopics = async (pageNumber: number, isRefresh = false) => {
    if (isRefresh && !initialLoading) setRefreshing(true);

    try {
      const response = await topicsService.getTopics({
        category: activeCategory,
        sort: sortOption,
        page: pageNumber,
        size: 15,
      });

      const formattedTopics = response.content.map((t) => ({
        ...t,
        authorIsAnonymous: t.isAnonymous,
        isSaved: t.isSavedByMe,
      }));

      setHasMore(response.hasNext);

      if (pageNumber === 0) {
        setTopics(formattedTopics);
      } else {
        setTopics((prev) => {
          const existingIds = new Set(prev.map((t) => t.id));
          const uniqueNew = formattedTopics.filter((t) => !existingIds.has(t.id));
          return [...prev, ...uniqueNew];
        });
      }
    } catch (error) {
      // Fallback or handle gracefully
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    setInitialLoading(true);
    setPage(0);
    loadTopics(0, true);
  }, [activeCategory, sortOption]);

  const onRefresh = useCallback(() => {
    setPage(0);
    loadTopics(0, true);
  }, [activeCategory, sortOption]);

  const onEndReached = useCallback(() => {
    if (loadingMore || !hasMore || initialLoading) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    loadTopics(nextPage);
  }, [loadingMore, page, hasMore, initialLoading, activeCategory, sortOption]);

  const currentSort = sortLabels[sortOption];

  return (
    <View style={styles.container}>
      {/* ── Shrinking header ── */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={[theme.colors.teal800, theme.colors.teal600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View
          style={[
            styles.headerInner,
            { transform: [{ scale: titleScale }], opacity: titleOpacity },
          ]}
        >
          <View style={styles.brandRow}>
            <View style={styles.headerMark}>
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={theme.colors.white}
              />
            </View>
            <Text style={styles.headerTitle}>SafeVoice</Text>
          </View>
        </Animated.View>

        <View style={styles.headerActions}>
          {/* Sort pill */}
          <TouchableOpacity
            style={[styles.sortPill, sortMenuOpen && styles.sortPillActive]}
            onPress={() => setSortMenuOpen((v) => !v)}
          >
            <Ionicons
              name={currentSort.icon as any}
              size={13}
              color={theme.colors.white}
            />
            <Text style={styles.sortPillText}>{currentSort.label}</Text>
            <Ionicons
              name={sortMenuOpen ? "chevron-up" : "chevron-down"}
              size={12}
              color="rgba(255,255,255,0.7)"
            />
          </TouchableOpacity>

          {/* Search */}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.getParent()?.navigate("SearchTab")}
          >
            <Ionicons name="search" size={19} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── Sort dropdown ── */}
      {sortMenuOpen && (
        <View style={styles.sortMenu}>
          {SORT_OPTIONS.map((opt, i) => {
            const s = sortLabels[opt];
            const active = opt === sortOption;
            const isLast = i === SORT_OPTIONS.length - 1;
            return (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.sortMenuItem,
                  active && styles.sortMenuItemActive,
                  isLast && styles.sortMenuItemLast,
                ]}
                onPress={() => {
                  setSortOption(opt);
                  setSortMenuOpen(false);
                }}
                activeOpacity={0.78}
              >
                <View
                  style={[
                    styles.sortMenuIconWrap,
                    active && styles.sortMenuIconWrapActive,
                  ]}
                >
                  <Ionicons
                    name={s.icon as any}
                    size={15}
                    color={active ? theme.colors.teal600 : theme.textSecondary}
                  />
                </View>
                <Text
                  style={[
                    styles.sortMenuLabel,
                    active && styles.sortMenuLabelActive,
                  ]}
                >
                  {s.label}
                </Text>
                {active && (
                  <View style={styles.sortMenuCheck}>
                    <Ionicons
                      name="checkmark"
                      size={13}
                      color={theme.colors.teal600}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* ── Category filter bar ── */}
      <FilterBar
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          setActiveCategory(cat);
          setSortMenuOpen(false);
        }}
      />

      {/* ── Feed ── */}
      {initialLoading ? (
        <View style={[styles.listContent, { flex: 1, justifyContent: "center" }]}>
          <ActivityIndicator size="large" color={theme.colors.teal600} />
        </View>
      ) : (
        <Animated.FlatList
          data={topics}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TopicCard
              topic={item}
              onPress={() =>
                navigation.navigate("TopicDetail", {
                  topicId: item.id,
                })
              }
            />
          )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.teal600}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="file-tray-outline"
                size={28}
                color={theme.colors.teal600}
              />
            </View>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptySubtitle}>
              Try a different category or sort option
            </Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              style={{ marginVertical: theme.spacing.lg }}
              color={theme.colors.teal600}
            />
          ) : (
            <View style={styles.endOfFeed}>
              <View style={styles.endLine} />
              <Text style={styles.endText}>You're all caught up</Text>
              <View style={styles.endLine} />
            </View>
          )
        }
      />
      )}

      {/* ── FAB: Create Topic (authenticated users only) ── */}
      {isAuthenticated && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("CreateTopic")}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color={theme.textOnPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundSecondary,
  },

  // ── FAB ──
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.brandPrimaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    overflow: "hidden",
  },
  headerInner: {
    flex: 1,
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sortPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  sortPillActive: {
    backgroundColor: "rgba(255,255,255,0.26)",
    borderColor: "rgba(255,255,255,0.4)",
  },
  sortPillText: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: "500",
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Sort dropdown ──
  sortMenu: {
    position: "absolute",
    top: HEADER_MIN_HEIGHT + 44,
    right: theme.spacing.lg,
    width: 216,
    backgroundColor: theme.backgroundPrimary,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    shadowColor: theme.colors.gray900,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 100,
    overflow: "hidden",
  },
  sortMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderDefault,
  },
  sortMenuItemActive: {
    backgroundColor: theme.colors.teal50,
  },
  sortMenuItemLast: {
    borderBottomWidth: 0,
  },
  sortMenuIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.backgroundSecondary,
  },
  sortMenuIconWrapActive: {
    backgroundColor: "rgba(20,184,166,0.1)",
  },
  sortMenuLabel: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.textSecondary,
  },
  sortMenuLabelActive: {
    color: theme.colors.teal600,
    fontWeight: "600",
  },
  sortMenuCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(20,184,166,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Feed ──
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 32,
  },

  // ── Empty state ──
  emptyState: {
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
    fontWeight: "600",
    color: theme.textPrimary,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.textTertiary,
    textAlign: "center",
  },

  // ── End-of-feed rule ──
  endOfFeed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
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
