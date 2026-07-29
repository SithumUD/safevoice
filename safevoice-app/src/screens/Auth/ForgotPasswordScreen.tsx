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
import { authService } from "../../services/authService";

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"request" | "reset" | "success">("request");
  const [focusedField, setFocusedField] = useState<"email" | "otp" | "password" | null>(null);

  const emailAnim = useRef(new Animated.Value(0)).current;

  const animateFocus = (anim: Animated.Value, focused: boolean) => {
    Animated.timing(anim, {
      toValue: focused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const handleSendOtp = async () => {
    if (!email || !email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setStep("reset");
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || otp.trim().length !== 6) {
      Alert.alert("Invalid Code", "Please enter the 6-digit OTP code sent to your email.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      Alert.alert("Weak Password", "New password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setStep("success");
    } catch (err: any) {
      Alert.alert("Reset Failed", err?.message ?? "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const emailBorder = emailAnim.interpolate({
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
              name="key"
              size={24}
              color={theme.colors.white}
            />
          </LinearGradient>

          <Text style={styles.eyebrow}>SafeVoice</Text>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            {step === "request"
              ? "Enter your email to receive a verification code"
              : step === "reset"
              ? "Enter the 6-digit code sent to " + email
              : "Your password has been reset successfully"}
          </Text>
        </View>

        <View style={styles.card}>
          {step === "success" ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle-outline" size={48} color={theme.colors.teal600} />
              <Text style={styles.successTitle}>Password Updated!</Text>
              <Text style={styles.successText}>You can now log in with your new password.</Text>
              <Button
                label="Back to Login"
                onPress={() => navigation.navigate("Login")}
                style={styles.loginButton}
              />
            </View>
          ) : step === "request" ? (
            <>
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

              <Button
                label="Send Code"
                onPress={handleSendOtp}
                loading={loading}
                style={styles.loginButton}
              />
            </>
          ) : (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>6-Digit Verification Code</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={17}
                    color={theme.colors.teal600}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="123456"
                    placeholderTextColor={theme.textTertiary}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={17}
                    color={theme.colors.teal600}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="At least 8 characters"
                    placeholderTextColor={theme.textTertiary}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <Button
                label="Confirm Reset"
                onPress={handleResetPassword}
                loading={loading}
                style={styles.loginButton}
              />
            </>
          )}
        </View>
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
    textAlign: 'center',
    paddingHorizontal: 20,
  },
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
  field: {
    marginBottom: theme.spacing.lg,
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
  loginButton: {
    marginTop: theme.spacing.sm,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  successTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: theme.fontSize.sm,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
});
