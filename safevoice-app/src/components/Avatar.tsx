// src/components/Avatar.tsx
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

interface AvatarProps {
  initials: string;
  color?: string;
  size?: number;
  isAnonymous?: boolean;
}

export default function Avatar({
  initials,
  color,
  size = 36,
  isAnonymous = false,
}: AvatarProps) {
  const bg = isAnonymous
    ? theme.anonymousLight
    : (color ?? theme.colors.gray100);
  const fg = isAnonymous ? theme.anonymousText : theme.colors.gray800;

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.38, color: fg }]}>
        {isAnonymous ? "?" : initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: theme.fontWeight.medium,
  },
});
