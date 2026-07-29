// src/components/Button.tsx
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle,
} from "react-native";
import { theme } from "../theme";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "outline" && styles.outline,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" ? theme.textOnPrimary : theme.brandPrimary
          }
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === "primary" && styles.labelPrimary,
            variant === "secondary" && styles.labelSecondary,
            variant === "outline" && styles.labelOutline,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 13,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: theme.brandPrimary,
  },
  secondary: {
    backgroundColor: theme.brandPrimaryLight,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.borderStrong,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
  },
  labelPrimary: {
    color: theme.textOnPrimary,
  },
  labelSecondary: {
    color: theme.brandPrimaryText,
  },
  labelOutline: {
    color: theme.textPrimary,
  },
});
