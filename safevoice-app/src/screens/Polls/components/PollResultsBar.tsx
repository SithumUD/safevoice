// src/screens/Polls/components/PollResultsBar.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { theme } from "../../../theme";
import { Poll } from "../../../types/models";
import CountdownTimer from "./CountdownTimer";

interface PollResultsBarProps {
  poll: Poll;
  onVote?: (optionId: string) => void;
}

// Per-rank accent colors (solid, used for text/icons/border)
const BAR_COLORS = [
  theme.colors.teal600,
  theme.colors.primary600,
  "#6366f1",
  "#f59e0b",
];

// Matching transparent fills — 14% opacity versions of each accent
const BAR_FILL_COLORS = [
  "rgba(13,148,136,0.13)", // teal
  "rgba(99,102,241,0.11)", // indigo
  "rgba(99,102,241,0.09)", // indigo variant
  "rgba(245,158,11,0.11)", // amber
];

// Lighter border to frame the selected track
const BAR_BORDER_COLORS = [
  "rgba(13,148,136,0.28)",
  "rgba(99,102,241,0.24)",
  "rgba(99,102,241,0.22)",
  "rgba(245,158,11,0.24)",
];

import { pollsService } from "../../../services/pollsService";

export default function PollResultsBar({ poll, onVote }: PollResultsBarProps) {
  const [localPoll, setLocalPoll] = useState(poll);

  // Animated widths per option id
  const animWidths = useRef<Record<string, Animated.Value>>(
    Object.fromEntries(
      poll.options.map((o) => [
        o.id,
        new Animated.Value(
          poll.totalVotes > 0
            ? Math.round((o.votes / poll.totalVotes) * 100)
            : 0,
        ),
      ]),
    ),
  ).current;

  const handleVote = async (optionId: string) => {
    if (localPoll.userHasVoted) return;

    const newTotal = localPoll.totalVotes + 1;

    const updated: typeof localPoll = {
      ...localPoll,
      userHasVoted: true,
      userVotedOptionId: optionId,
      totalVotes: newTotal,
      options: localPoll.options.map((o) =>
        o.id === optionId ? { ...o, votes: o.votes + 1 } : o,
      ),
    };

    setLocalPoll(updated);

    // Animate bars to new percentages
    updated.options.forEach((o) => {
      const pct = Math.round((o.votes / newTotal) * 100);
      Animated.spring(animWidths[o.id], {
        toValue: pct,
        friction: 8,
        tension: 60,
        useNativeDriver: false,
      }).start();
    });

    onVote?.(optionId);

    try {
      await pollsService.submitVote(poll.id, [optionId]);
    } catch (e: any) {
      Alert.alert("Vote Error", e.message || "Could not submit vote");
    }
  };

  const sortedIds = [...localPoll.options]
    .sort((a, b) => b.votes - a.votes)
    .map((o) => o.id);

  return (
    <View style={styles.container}>
      {/* Question */}
      <Text style={styles.question}>{localPoll.question}</Text>

      {/* Options */}
      <View style={styles.options}>
        {localPoll.options.map((option) => {
          const pct =
            localPoll.totalVotes > 0
              ? Math.round((option.votes / localPoll.totalVotes) * 100)
              : 0;
          const isSelected = localPoll.userVotedOptionId === option.id;
          const rank = sortedIds.indexOf(option.id);
          const accentColor =
            BAR_COLORS[rank] ?? BAR_COLORS[BAR_COLORS.length - 1];
          const fillColor =
            BAR_FILL_COLORS[rank] ??
            BAR_FILL_COLORS[BAR_FILL_COLORS.length - 1];
          const borderColor =
            BAR_BORDER_COLORS[rank] ??
            BAR_BORDER_COLORS[BAR_BORDER_COLORS.length - 1];
          const isLeading = rank === 0 && localPoll.totalVotes > 0;

          if (localPoll.userHasVoted) {
            const animPct = animWidths[option.id];
            const fillWidth = animPct.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
              extrapolate: "clamp",
            });

            return (
              <View key={option.id} style={styles.resultRow}>
                <View
                  style={[
                    styles.resultTrack,
                    isSelected && {
                      borderColor,
                      backgroundColor: "transparent",
                    },
                  ]}
                >
                  {/* Transparent fill bar */}
                  <Animated.View
                    style={[
                      styles.resultFill,
                      {
                        width: fillWidth,
                        // Selected gets the tinted fill; others get a neutral ghost
                        backgroundColor: isSelected
                          ? fillColor
                          : "rgba(0,0,0,0.03)",
                      },
                    ]}
                  />

                  {/* Label row */}
                  <View style={styles.resultLabelRow}>
                    <View style={styles.resultLabelLeft}>
                      {isSelected ? (
                        // Checkmark dot in accent color
                        <View
                          style={[
                            styles.checkDot,
                            { backgroundColor: accentColor },
                          ]}
                        >
                          <Ionicons
                            name="checkmark"
                            size={9}
                            color={theme.colors.white}
                          />
                        </View>
                      ) : isLeading ? (
                        <Ionicons
                          name="trending-up"
                          size={12}
                          color={accentColor}
                        />
                      ) : (
                        // Neutral circle placeholder to keep text aligned
                        <View style={styles.neutralDot} />
                      )}

                      <Text
                        style={[
                          styles.resultLabel,
                          isSelected && {
                            color: accentColor,
                            fontWeight: theme.fontWeight.semibold,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {option.label}
                      </Text>
                    </View>

                    {/* Percentage — accented for selected/leading */}
                    <Text
                      style={[
                        styles.resultPct,
                        (isSelected || isLeading) && {
                          color: accentColor,
                          fontWeight: theme.fontWeight.bold,
                        },
                      ]}
                    >
                      {pct}%
                    </Text>
                  </View>
                </View>
              </View>
            );
          }

          // ── Pre-vote option ──
          return (
            <TouchableOpacity
              key={option.id}
              style={styles.voteOption}
              onPress={() => handleVote(option.id)}
              activeOpacity={0.72}
            >
              <View style={styles.voteOptionDot} />
              <Text style={styles.voteOptionLabel}>{option.label}</Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={theme.textTertiary}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Ionicons
            name="people-outline"
            size={12}
            color={theme.textTertiary}
          />
          <Text style={styles.totalVotes}>
            {localPoll.totalVotes.toLocaleString()} votes
          </Text>
        </View>
        <CountdownTimer closesAt={localPoll.closesAt} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },

  question: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.textPrimary,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },

  options: {
    gap: 7,
    marginBottom: theme.spacing.md,
  },

  // ── Pre-vote ──
  voteOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: theme.borderDefault,
    borderRadius: theme.radius.lg,
    paddingVertical: 11,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.backgroundSecondary,
  },
  voteOptionDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.teal600,
    backgroundColor: theme.colors.teal50,
  },
  voteOptionLabel: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.textPrimary,
    fontWeight: theme.fontWeight.medium,
  },

  // ── Result row ──
  resultRow: {
    width: "100%",
  },
  resultTrack: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    position: "relative",
    height: 40,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.borderDefault,
  },
  resultFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    // borderRadius so the fill edge looks smooth at low percentages
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  resultLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    gap: 8,
  },
  resultLabelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flex: 1,
  },
  checkDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  // Invisible spacer so unselected/non-leading rows keep text aligned
  neutralDot: {
    width: 16,
    height: 16,
    flexShrink: 0,
  },
  resultLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.textPrimary,
    flex: 1,
  },
  resultPct: {
    fontSize: theme.fontSize.sm,
    color: theme.textSecondary,
    fontWeight: theme.fontWeight.medium,
    minWidth: 36,
    textAlign: "right",
    flexShrink: 0,
  },

  // ── Footer ──
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  totalVotes: {
    fontSize: theme.fontSize.xs,
    color: theme.textTertiary,
    fontWeight: "500",
  },
});
