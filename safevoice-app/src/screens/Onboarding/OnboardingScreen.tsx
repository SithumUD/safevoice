// src/screens/Onboarding/OnboardingScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../components/Button";
import { theme } from "../../theme";

const { width } = Dimensions.get("window");

const slides = [
  {
    icon: "shield-checkmark-outline" as const,
    title: "Your safety comes first",
    body: "SafeVoice protects who you are while you say what you think — especially on the topics that feel too risky to post under your real name.",
  },
  {
    icon: "chatbubbles-outline" as const,
    title: "Join the conversation",
    body: "Discuss the topics that matter to Sri Lankans — from daily life to national issues — in threaded discussions built for real back-and-forth.",
  },
  {
    icon: "stats-chart-outline" as const,
    title: "Vote and see real results",
    body: "Cast your vote on live polls and watch results update in real time as the community responds.",
  },
  {
    icon: "eye-off-outline" as const,
    title: "Speak freely, anonymously",
    body: "Switch on anonymous mode for any comment, any time. Only you can see what you posted anonymously — no one else ever can.",
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const goToSlide = (i: number) => {
    listRef.current?.scrollToIndex({ index: i, animated: true });
    setIndex(i);
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("HAS_SEEN_ONBOARDING", "true");
    } catch (error) {
      console.error("Error saving onboarding state:", error);
    }
    navigation.replace("AuthHome");
  };

  const handleNext = () => {
    if (index < slides.length - 1) {
      goToSlide(index + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleMomentumScrollEnd = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(newIndex);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        {index > 0 ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => goToSlide(index - 1)}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}

        <TouchableOpacity onPress={completeOnboarding}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <Animated.FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: false,
          },
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        renderItem={({ item, index: i }) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const iconScale = scrollX.interpolate({
            inputRange,
            outputRange: [0.7, 1, 0.7],
            extrapolate: "clamp",
          });
          const iconOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });
          const textTranslateY = scrollX.interpolate({
            inputRange,
            outputRange: [16, 0, 16],
            extrapolate: "clamp",
          });
          const textOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: "clamp",
          });

          return (
            <View style={[styles.slide, { width }]}>
              <Animated.View
                style={[
                  styles.iconCircle,
                  { transform: [{ scale: iconScale }], opacity: iconOpacity },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={40}
                  color={theme.brandPrimary}
                />
              </Animated.View>

              <Animated.View
                style={{
                  opacity: textOpacity,
                  transform: [{ translateY: textTranslateY }],
                }}
              >
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
              </Animated.View>
            </View>
          );
        }}
      />

      <View style={styles.dots}>
        {slides.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [6, 18, 6],
            extrapolate: "clamp",
          });
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: "clamp",
          });
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]}
            />
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button
          label={index === slides.length - 1 ? "Get started" : "Next"}
          onPress={handleNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundPrimary,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  skipText: {
    fontSize: theme.fontSize.sm,
    color: theme.textTertiary,
    paddingVertical: theme.spacing.sm,
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xxl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.brandPrimaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.textPrimary,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  body: {
    fontSize: theme.fontSize.base,
    color: theme.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: theme.spacing.xl,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.brandPrimary,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
});
