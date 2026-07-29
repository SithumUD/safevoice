// src/screens/Auth/LoginScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../components/Button";
import { theme } from "../../theme";
import { getAuthState } from "../../store/authStore";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(
    null,
  );

  const emailAnim = useRef(new Animated.Value(0)).current;
  const passwordAnim = useRef(new Animated.Value(0)).current;

  const animateFocus = (anim: Animated.Value, focused: boolean) => {
    Animated.timing(anim, {
      toValue: focused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await getAuthState().login(email.trim(), password);

      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Login failed. Please check your credentials.";
      Alert.alert("Authentication Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const emailBorder = emailAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.borderStrong, theme.colors.teal600],
  });
  const passwordBorder = passwordAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.borderStrong, theme.colors.teal600],
  });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header area with subtle teal arc matching AuthHomeScreen */}
        <View style={styles.headerArea}>
          <View style={styles.bgArc} pointerEvents="none" />

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={theme.colors.teal800}
            />
          </TouchableOpacity>

          <LinearGradient
            colors={[theme.colors.teal600, theme.colors.primary600]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoCircle}
          >
            <Ionicons
              name="shield-checkmark"
              size={24}
              color={theme.colors.white}
            />
          </LinearGradient>

          <Text style={styles.eyebrow}>SafeVoice</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Log in to continue the conversation
          </Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email address</Text>
            <Animated.View
              style={[styles.inputWrapper, { borderColor: emailBorder }]}
            >
              <Ionicons
                name="mail-outline"
                size={17}
                color={
                  focusedField === "email"
                    ? theme.colors.teal600
                    : theme.textTertiary
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={theme.textTertiary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => {
                  setFocusedField("email");
                  animateFocus(emailAnim, true);
                }}
                onBlur={() => {
                  setFocusedField(null);
                  animateFocus(emailAnim, false);
                }}
              />
            </Animated.View>
          </View>

          {/* Password */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <Animated.View
              style={[styles.inputWrapper, { borderColor: passwordBorder }]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={17}
                color={
                  focusedField === "password"
                    ? theme.colors.teal600
                    : theme.textTertiary
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={theme.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => {
                  setFocusedField("password");
                  animateFocus(passwordAnim, true);
                }}
                onBlur={() => {
                  setFocusedField(null);
                  animateFocus(passwordAnim, false);
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={theme.textTertiary}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>

          <Button
            label="Log in"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social buttons */}
          <View style={styles.socialRow}>
            {(
              [
                { icon: "logo-google", label: "Google" },
                { icon: "logo-apple", label: "Apple" },
                { icon: "logo-facebook", label: "Facebook" },
              ] as const
            ).map(({ icon, label }) => (
              <TouchableOpacity key={label} style={styles.socialButton}>
                <Ionicons name={icon} size={19} color={theme.textPrimary} />
                <Text style={styles.socialLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <TouchableOpacity
          style={styles.signupRow}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Text style={styles.signupLink}>Create one</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.backgroundSecondary,
  },
  scroll: {
    flexGrow: 1,
  },

  // Header
  headerArea: {
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: theme.spacing.xl,
    overflow: "hidden",
  },
  bgArc: {
    position: "absolute",
    top: -140,
    alignSelf: "center",
    width: 480,
    height: 480,
    borderRadius: 240,
    backgroundColor: theme.colors.teal50,
    opacity: 0.6,
  },
  backButton: {
    position: "absolute",
    top: 52,
    left: theme.spacing.xl,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: theme.colors.teal800,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.teal600,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.textSecondary,
  },

  // Card
  card: {
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.backgroundPrimary,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    padding: theme.spacing.xl,
    shadowColor: theme.colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  // Fields
  field: {
    marginBottom: theme.spacing.lg,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.backgroundSecondary,
    paddingHorizontal: theme.spacing.md,
    height: 50,
  },
  inputIcon: {
    marginRight: 9,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.base,
    color: theme.textPrimary,
    height: "100%",
  },
  eyeButton: {
    padding: 4,
    marginLeft: 4,
  },
  forgotText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.teal600,
    fontWeight: theme.fontWeight.medium,
  },
  loginButton: {
    marginTop: theme.spacing.sm,
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.borderDefault,
  },
  dividerText: {
    fontSize: theme.fontSize.xs,
    color: theme.textTertiary,
  },

  // Social
  socialRow: {
    flexDirection: "row",
    gap: 10,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    height: 44,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.borderStrong,
    backgroundColor: theme.backgroundPrimary,
  },
  socialLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.textPrimary,
  },

  // Footer
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  signupText: {
    fontSize: theme.fontSize.sm,
    color: theme.textSecondary,
  },
  signupLink: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.teal600,
    fontWeight: theme.fontWeight.semibold,
  },
});
