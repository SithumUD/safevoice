// src/screens/Home/components/FilterBar.tsx
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../../theme";

export const categories = ['All', 'Politics', 'Sports', 'Technology', 'Food', 'Education', 'Transport', 'Lifestyle'];

interface FilterBarProps {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}

export default function FilterBar({
  activeCategory,
  onCategoryChange,
}: FilterBarProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const active = cat === activeCategory;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => onCategoryChange(cat)}
              style={[styles.pill, active && styles.pillActive]}
              activeOpacity={0.78}
            >
              {active && <View style={styles.activeDot} />}
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    borderBottomColor: theme.borderDefault,
    backgroundColor: theme.backgroundPrimary,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    gap: 8,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    backgroundColor: theme.backgroundSecondary,
  },
  pillActive: {
    backgroundColor: theme.colors.teal50,
    borderColor: theme.colors.teal600,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.teal600,
  },
  pillText: {
    fontSize: theme.fontSize.sm,
    color: theme.textSecondary,
    fontWeight: "500",
  },
  pillTextActive: {
    color: theme.colors.teal600,
    fontWeight: "700",
  },
});
