// src/screens/Polls/components/CountdownTimer.tsx
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../../theme";

interface CountdownTimerProps {
  closesAt: string;
}

function formatRemaining(ms: number): {
  text: string;
  isUrgent: boolean;
  isClosed: boolean;
} {
  if (ms <= 0) return { text: "Poll closed", isUrgent: false, isClosed: true };
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const isUrgent = hours < 3;
  if (days > 0)
    return { text: `${days}d ${hours % 24}h left`, isUrgent, isClosed: false };
  if (hours > 0)
    return {
      text: `${hours}h ${totalMinutes % 60}m left`,
      isUrgent,
      isClosed: false,
    };
  return { text: `${totalMinutes}m left`, isUrgent, isClosed: false };
}

export default function CountdownTimer({ closesAt }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(
    () => new Date(closesAt).getTime() - Date.now(),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(new Date(closesAt).getTime() - Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, [closesAt]);

  const { text, isUrgent, isClosed } = formatRemaining(remaining);

  return (
    <View
      style={[
        styles.chip,
        isUrgent && !isClosed && styles.chipUrgent,
        isClosed && styles.chipClosed,
      ]}
    >
      <Ionicons
        name={
          isClosed
            ? "lock-closed"
            : isUrgent
              ? "warning-outline"
              : "time-outline"
        }
        size={11}
        color={
          isClosed
            ? theme.textTertiary
            : isUrgent
              ? theme.disagree
              : theme.colors.teal600
        }
      />
      <Text
        style={[
          styles.text,
          isUrgent && !isClosed && styles.textUrgent,
          isClosed && styles.textClosed,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.teal50,
    borderWidth: 1,
    borderColor: theme.colors.teal100,
  },
  chipUrgent: {
    backgroundColor: "rgba(239,68,68,0.07)",
    borderColor: "rgba(239,68,68,0.2)",
  },
  chipClosed: {
    backgroundColor: theme.backgroundSecondary,
    borderColor: theme.borderDefault,
  },
  text: {
    fontSize: 11,
    color: theme.colors.teal600,
    fontWeight: "600",
  },
  textUrgent: {
    color: theme.disagree,
  },
  textClosed: {
    color: theme.textTertiary,
    fontWeight: "500",
  },
});
