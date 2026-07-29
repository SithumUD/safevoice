// src/screens/Search/SearchScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../theme";
import TopicCard from "../Home/components/TopicCard";
import { topicsService } from "../../services/topicsService";

const categories = ["All", "CIVIC", "SAFETY", "EDUCATION", "COMMUNITY", "GENERAL", "POLLS"];

export default function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const underlineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    topicsService
      .getTopics({ sort: "trending", size: 4 })
      .then((res) => {
        setTrendingTopics(
          res.content.map((t) => ({
            ...t,
            authorIsAnonymous: t.isAnonymous,
          }))
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim() && activeCategory === "All") {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await topicsService.getTopics({
          category: activeCategory,
          sort: "latest",
          size: 20,
        });

        let filtered = res.content;
        if (query.trim().length > 0) {
          const q = query.toLowerCase().trim();
          filtered = filtered.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.description.toLowerCase().includes(q)
          );
        }

        const formatted = filtered.map((t) => ({
          ...t,
          authorIsAnonymous: t.isAnonymous,
          isSaved: t.isSavedByMe,
        }));

        setResults(formatted);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, activeCategory]);

  const animateFocus = (focused: boolean) => {
    Animated.timing(underlineAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = underlineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.borderDefault, theme.colors.teal600],
  });

  const hasQuery = query.trim().length > 0;

  return (
    <View style={styles.container}>
      {/* ── Header — fixed 56 px, no top padding ── */}
      <LinearGradient
        colors={[theme.colors.teal800, theme.colors.teal600]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.brandRow}>
          <View style={styles.headerMark}>
            <Ionicons name="search" size={14} color={theme.colors.white} />
          </View>
          <Text style={styles.headerTitle}>Search</Text>
        </View>
      </LinearGradient>

      {/* ── Search bar — sits below header, outside gradient ── */}
      <View style={styles.searchBarWrapper}>
        <Animated.View style={[styles.searchBar, { borderColor }]}>
          <Ionicons
            name="search"
            size={17}
            color={isFocused ? theme.colors.teal600 : theme.textTertiary}
          />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Discussions, topics, polls…"
            placeholderTextColor={theme.textTertiary}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => {}}
            onFocus={() => {
              setIsFocused(true);
              animateFocus(true);
            }}
            onBlur={() => {
              setIsFocused(false);
              animateFocus(false);
            }}
          />
          {hasQuery && (
            <TouchableOpacity
              onPress={() => setQuery("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="close-circle"
                size={17}
                color={theme.textTertiary}
              />
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>

      {/* ── Category chips ── */}
      {(hasQuery || activeCategory !== 'All') && (
        <View style={styles.chipsWrapper}>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(c) => c}
            contentContainerStyle={styles.chipsContent}
            renderItem={({ item }) => {
              const active = item === activeCategory;
              return (
                <TouchableOpacity
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setActiveCategory(item)}
                  activeOpacity={0.78}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {/* ── Content ── */}
      {!hasQuery && activeCategory === 'All' ? (
        <FlatList
          data={[]}
          keyExtractor={() => ""}
          renderItem={null}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.discoveryContainer}>

              {/* Trending */}
              <View style={styles.discoverSection}>
                <View style={styles.discoverHeader}>
                  <Ionicons
                    name="flame-outline"
                    size={14}
                    color={theme.trending}
                  />
                  <Text style={styles.discoverTitle}>Trending now</Text>
                </View>
                {trendingTopics.map((topic) => (
                  <TouchableOpacity
                    key={topic.id}
                    style={styles.trendingItem}
                    activeOpacity={0.78}
                    onPress={() =>
                      navigation.navigate("Home", {
                        screen: "TopicDetail",
                        params: { topicId: topic.id },
                      })
                    }
                  >
                    <View style={styles.trendingLeft}>
                      <View style={styles.trendingFlame}>
                        <Ionicons
                          name="flame"
                          size={12}
                          color={theme.trending}
                        />
                      </View>
                      <View style={styles.trendingMeta}>
                        <Text style={styles.trendingTitle} numberOfLines={1}>
                          {topic.title}
                        </Text>
                        <Text style={styles.trendingCategory}>
                          {topic.category}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.trendingRight}>
                      <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={12}
                        color={theme.textTertiary}
                      />
                      <Text style={styles.trendingCount}>
                        {topic.commentCount}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Browse by category */}
              <View style={styles.discoverSection}>
                <View style={styles.discoverHeader}>
                  <Ionicons
                    name="grid-outline"
                    size={14}
                    color={theme.textTertiary}
                  />
                  <Text style={styles.discoverTitle}>Browse by category</Text>
                </View>
                <View style={styles.categoryGrid}>
                  {categories.filter((c) => c !== "All").map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={styles.categoryTile}
                      onPress={() => {
                        setQuery(cat);
                        setActiveCategory(cat);
                      }}
                      activeOpacity={0.78}
                    >
                      <Text style={styles.categoryTileText} numberOfLines={1}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          }
        />
      ) : isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.teal600} />
          <Text style={styles.emptySubtitle}>Searching...</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons
              name="file-tray-outline"
              size={28}
              color={theme.colors.teal600}
            />
          </View>
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySubtitle}>
            Nothing matched <Text style={styles.emptyQuery}>"{query}"</Text>
            {activeCategory !== "All" && ` in ${activeCategory}`}
          </Text>
          {activeCategory !== "All" && (
            <TouchableOpacity
              style={styles.clearCategoryButton}
              onPress={() => setActiveCategory("All")}
            >
              <Text style={styles.clearCategoryText}>
                Search all categories
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {results.length} {results.length === 1 ? "result" : "results"}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TopicCard
              topic={item}
              onPress={() =>
                navigation.navigate("Home", {
                  screen: "TopicDetail",
                  params: { topicId: item.id },
                })
              }
            />
          )}
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
    paddingHorizontal: theme.spacing.lg,
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

  // ── Search bar ──
  searchBarWrapper: {
    backgroundColor: theme.backgroundPrimary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderDefault,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.backgroundSecondary,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.base,
    color: theme.textPrimary,
    height: "100%",
  },

  // ── Category chips ──
  chipsWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: theme.borderDefault,
    backgroundColor: theme.backgroundPrimary,
  },
  chipsContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    backgroundColor: theme.backgroundSecondary,
  },
  chipActive: {
    backgroundColor: theme.colors.teal50,
    borderColor: theme.colors.teal600,
  },
  chipText: {
    fontSize: theme.fontSize.xs,
    color: theme.textSecondary,
    fontWeight: "500",
  },
  chipTextActive: {
    color: theme.colors.teal600,
    fontWeight: "700",
  },

  // ── Results ──
  resultsHeader: {
    paddingBottom: theme.spacing.sm,
  },
  resultsCount: {
    fontSize: theme.fontSize.xs,
    color: theme.textTertiary,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 32,
  },

  // ── Discovery ──
  discoveryContainer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  discoverSection: {
    gap: theme.spacing.sm,
  },
  discoverHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  discoverTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
    color: theme.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  recentList: {
    backgroundColor: theme.backgroundPrimary,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    overflow: "hidden",
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 13,
  },
  recentItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.borderDefault,
  },
  recentText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.textPrimary,
  },
  trendingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.backgroundPrimary,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    marginBottom: 6,
  },
  trendingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  trendingFlame: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(245,158,11,0.1)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  trendingMeta: { flex: 1 },
  trendingTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.textPrimary,
    marginBottom: 2,
  },
  trendingCategory: {
    fontSize: 11,
    color: theme.textTertiary,
  },
  trendingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  trendingCount: {
    fontSize: 11,
    color: theme.textTertiary,
    fontWeight: "500",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryTile: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.backgroundPrimary,
    borderWidth: 1,
    borderColor: theme.borderDefault,
  },
  categoryTileText: {
    fontSize: theme.fontSize.xs,
    color: theme.textSecondary,
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
  emptyQuery: {
    color: theme.textPrimary,
    fontWeight: "600",
  },
  clearCategoryButton: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.teal50,
    borderWidth: 1,
    borderColor: theme.colors.teal100,
  },
  clearCategoryText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.teal600,
    fontWeight: "600",
  },
});
