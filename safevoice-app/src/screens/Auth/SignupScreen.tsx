// src/screens/Auth/SignupScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
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

type FieldName = "nickname" | "email" | "password";

const PREDEFINED_AVATARS = [
  "https://api.dicebear.com/9.x/notionists/png?seed=Felix",
  "https://api.dicebear.com/9.x/notionists/png?seed=Aneka",
  "https://api.dicebear.com/9.x/notionists/png?seed=Zack",
  "https://api.dicebear.com/9.x/notionists/png?seed=Maya",
];

function getPasswordStrength(pass: string): {
  level: number;
  label: string;
  color: string;
} {
  if (!pass) return { level: 0, label: "", color: "transparent" };
  if (pass.length < 6)
    return { level: 1, label: "Weak", color: theme.disagree };
  if (pass.length < 10)
    return { level: 2, label: "Fair", color: theme.trending };
  return { level: 3, label: "Strong", color: theme.agree };
}

export default function SignupScreen({ navigation }: any) {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<FieldName | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState(PREDEFINED_AVATARS[0]);

  const nicknameAnim = useRef(new Animated.Value(0)).current;
  const emailAnim = useRef(new Animated.Value(0)).current;
  const passwordAnim = useRef(new Animated.Value(0)).current;

  const animMap: Record<FieldName, Animated.Value> = {
    nickname: nicknameAnim,
    email: emailAnim,
    password: passwordAnim,
  };

  const animateFocus = (field: FieldName, focused: boolean) => {
    Animated.timing(animMap[field], {
      toValue: focused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const getBorderColor = (field: FieldName) =>
    animMap[field].interpolate({
      inputRange: [0, 1],
      outputRange: [theme.borderStrong, theme.colors.teal600],
    });

  const handleSignup = async () => {
    if (!email || !password || !nickname) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await getAuthState().register(
        email.trim(),
        password,
        nickname.trim()
      );

      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      });
    } catch (err: any) {
      let errorMessage = err.response?.data?.message || err.message || "Registration failed.";
      if (err.message === "Network Error" || !err.response) {
        errorMessage = "Cannot connect to backend server.\n\n• If running on physical mobile device: Update .env EXPO_PUBLIC_API_BASE_URL to your computer's local Wi-Fi IP (e.g. http://192.168.x.x:8080/api/v1).\n• Ensure Spring Boot server is running on port 8080 and CORS is enabled.";
      }
      Alert.alert("Registration Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

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
        {/* Header */}
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
            <Ionicons name="person-add" size={22} color={theme.colors.white} />
          </LinearGradient>

          <Text style={styles.eyebrow}>SafeVoice</Text>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Your nickname is public.{" "}
            <Text style={styles.subtitleAccent}>Your email never is.</Text>
          </Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          {/* Avatar Picker */}
          <View style={styles.field}>
            <Text style={styles.label}>Profile Image</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarList}>
              {PREDEFINED_AVATARS.map((url) => (
                <TouchableOpacity
                  key={url}
                  onPress={() => setSelectedAvatar(url)}
                  style={[
                    styles.avatarWrapper,
                    selectedAvatar === url && styles.avatarSelected,
                  ]}
                >
                  <Image source={{ uri: url }} style={styles.avatarImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Nickname */}
          <View style={styles.field}>
            <Text style={styles.label}>Nickname</Text>
            <Animated.View
              style={[
                styles.inputWrapper,
                { borderColor: getBorderColor("nickname") },
              ]}
            >
              <Ionicons
                name="at-outline"
                size={17}
                color={
                  focusedField === "nickname"
                    ? theme.colors.teal600
                    : theme.textTertiary
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="e.g. colombo_commuter"
                placeholderTextColor={theme.textTertiary}
                value={nickname}
                onChangeText={setNickname}
                autoCapitalize="none"
                onFocus={() => {
                  setFocusedField("nickname");
                  animateFocus("nickname", true);
                }}
                onBlur={() => {
                  setFocusedField(null);
                  animateFocus("nickname", false);
                }}
              />
              {nickname.length > 2 && (
                <Ionicons
                  name="checkmark-circle"
                  size={17}
                  color={theme.agree}
                />
              )}
            </Animated.View>
            <Text style={styles.hint}>
              This is how others will see you in discussions
            </Text>
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email address</Text>
            <Animated.View
              style={[
                styles.inputWrapper,
                { borderColor: getBorderColor("email") },
              ]}
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
                  animateFocus("email", true);
                }}
                onBlur={() => {
                  setFocusedField(null);
                  animateFocus("email", false);
                }}
              />
            </Animated.View>
            <View style={styles.privateRow}>
              <Ionicons
                name="lock-closed"
                size={11}
                color={theme.colors.teal600}
              />
              <Text style={styles.privateText}>
                Never shared or shown publicly
              </Text>
            </View>
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <Animated.View
              style={[
                styles.inputWrapper,
                { borderColor: getBorderColor("password") },
              ]}
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
                placeholder="At least 8 characters"
                placeholderTextColor={theme.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => {
                  setFocusedField("password");
                  animateFocus("password", true);
                }}
                onBlur={() => {
                  setFocusedField(null);
                  animateFocus("password", false);
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

            {/* Password strength meter */}
            {password.length > 0 && (
              <View style={styles.strengthRow}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3].map((lvl) => (
                    <View
                      key={lvl}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor:
                            strength.level >= lvl
                              ? strength.color
                              : theme.borderDefault,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                  {strength.label}
                </Text>
              </View>
            )}
          </View>

          <Button
            label="Create account"
            onPress={handleSignup}
            loading={loading}
            style={styles.submitButton}
          />

          <Text style={styles.terms}>
            By signing up you agree to our{" "}
            <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
            <Text style={styles.termsLink}>Community Guidelines</Text>
          </Text>
        </View>

        {/* Footer */}
        <TouchableOpacity
          style={styles.loginRow}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginText}>Already have an account? </Text>
          <Text style={styles.loginLink}>Log in</Text>
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
    paddingBottom: 28,
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
    textAlign: "center",
  },
  subtitleAccent: {
    color: theme.colors.teal600,
    fontWeight: theme.fontWeight.medium,
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

  // Avatar Picker
  avatarList: {
    paddingVertical: 4,
    gap: 12,
  },
  avatarWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 2,
  },
  avatarSelected: {
    borderColor: theme.colors.teal600,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    backgroundColor: theme.backgroundSecondary,
  },

  // Fields
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
  eyeButton: {
    padding: 4,
    marginLeft: 4,
  },
  hint: {
    fontSize: 11,
    color: theme.textTertiary,
    marginTop: 5,
    marginLeft: 2,
  },
  privateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
    marginLeft: 2,
  },
  privateText: {
    fontSize: 11,
    color: theme.colors.teal600,
  },

  // Password strength
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: theme.fontWeight.medium,
    width: 44,
    textAlign: "right",
  },

  // Submit
  submitButton: {
    marginTop: theme.spacing.sm,
  },
  terms: {
    fontSize: 11,
    color: theme.textTertiary,
    textAlign: "center",
    marginTop: theme.spacing.md,
    lineHeight: 16,
  },
  termsLink: {
    color: theme.colors.teal600,
  },

  // Footer
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  loginText: {
    fontSize: theme.fontSize.sm,
    color: theme.textSecondary,
  },
  loginLink: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.teal600,
    fontWeight: theme.fontWeight.semibold,
  },
});
