// src/screens/TopicDetail/components/CommentInput.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../../theme";

import * as ImagePicker from 'expo-image-picker';
import { validateMedia } from '../../../utils/cloudinary';

interface CommentInputProps {
  replyingTo?: string | null;
  onCancelReply?: () => void;
  onSubmit: (text: string, isAnonymous: boolean, media?: { uri: string; type: 'image' | 'video'; fileSize?: number; duration?: number }) => void;
}

const EMOJI_SETS = [
  ["😂", "❤️", "🔥", "👏", "😮", "😢", "😡", "🤔"],
  ["👍", "👎", "🙌", "💯", "🎉", "🤝", "💪", "🙏"],
  ["😍", "😭", "🥹", "😤", "🤣", "😅", "🤯", "👀"],
];

const STICKERS = ["🇱🇰", "⚡", "🏆", "📢", "🎯", "🌊", "🦁", "✊"];

type MediaItem = {
  id: string;
  type: "image" | "video";
  uri: string;
  fileSize?: number;
  duration?: number;
};

type Panel = "none" | "emoji" | "media" | "sticker";
type EmojiPage = 0 | 1 | 2;

export default function CommentInput({
  replyingTo,
  onCancelReply,
  onSubmit,
}: CommentInputProps) {
  const [text, setText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [activePanel, setActivePanel] = useState<Panel>("none");
  const [emojiPage, setEmojiPage] = useState<EmojiPage>(0);
  const [attachments, setAttachments] = useState<MediaItem[]>([]);

  const panelHeight = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const openPanel = (panel: Panel) => {
    const opening = activePanel !== panel;
    setActivePanel(opening ? panel : "none");
    Animated.spring(panelHeight, {
      toValue: opening ? 1 : 0,
      friction: 14,
      tension: 120,
      useNativeDriver: false,
    }).start();
  };

  const appendEmoji = (emoji: string) => setText((t) => t + emoji);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const type = asset.type === 'video' ? 'video' : 'image';
      
      const validation = await validateMedia(
        asset.uri,
        type,
        asset.fileSize ?? undefined,
        asset.duration ?? undefined
      );
      if (!validation.valid) {
        Alert.alert("Cannot attach media", validation.error);
        return;
      }
      
      setAttachments([{
        id: Date.now().toString(),
        type,
        uri: asset.uri,
        fileSize: asset.fileSize ?? undefined,
        duration: asset.duration ?? undefined,
      }]);
    }
  };

  const removeMedia = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = () => {
    if (!text.trim() && attachments.length === 0) return;
    onSubmit(text.trim(), isAnonymous, attachments[0]);
    setText("");
    setAttachments([]);
    setActivePanel("none");
    Animated.timing(panelHeight, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const panelHeightPx = panelHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 196],
  });
  const panelOpacity = panelHeight.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.6, 1],
  });

  const canSend = text.trim().length > 0 || attachments.length > 0;

  return (
    <View style={styles.wrapper}>
      {/* Reply banner */}
      {replyingTo && (
        <View style={styles.replyBanner}>
          <View style={styles.replyBannerLeft}>
            <View style={styles.replyAccent} />
            <Ionicons
              name="arrow-undo-outline"
              size={13}
              color={theme.colors.teal600}
            />
            <Text style={styles.replyText}>
              Replying to <Text style={styles.replyName}>{replyingTo}</Text>
            </Text>
          </View>
          <TouchableOpacity onPress={onCancelReply} style={styles.replyClose}>
            <Ionicons name="close" size={15} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Attachment chips */}
      {attachments.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.attachmentScroll}
          contentContainerStyle={styles.attachmentRow}
        >
          {attachments.map((a) => (
            <View key={a.id} style={styles.attachmentChip}>
              <Ionicons
                name={a.type === 'video' ? "videocam-outline" : "image-outline"}
                size={14}
                color={theme.colors.teal600}
              />
              <Text style={styles.attachmentLabel}>Attached {a.type}</Text>
              <TouchableOpacity onPress={() => removeMedia(a.id)}>
                <Ionicons
                  name="close-circle"
                  size={15}
                  color={theme.textTertiary}
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Main input row */}
      <View style={styles.inputRow}>
        {/* Anonymous avatar */}
        <TouchableOpacity
          style={[styles.anonAvatar, isAnonymous && styles.anonAvatarActive]}
          onPress={() => setIsAnonymous((v) => !v)}
        >
          <Ionicons
            name={isAnonymous ? "eye-off" : "person"}
            size={15}
            color={isAnonymous ? theme.colors.teal600 : theme.textTertiary}
          />
        </TouchableOpacity>

        {/* Text field */}
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={
            isAnonymous ? "Comment anonymously..." : "Add to the discussion..."
          }
          placeholderTextColor={theme.textTertiary}
          value={text}
          onChangeText={setText}
          multiline
          onFocus={() => {
            if (activePanel !== "none") {
              setActivePanel("none");
              Animated.timing(panelHeight, {
                toValue: 0,
                duration: 150,
                useNativeDriver: false,
              }).start();
            }
          }}
        />

        {/* Media toolbar — emoji, image, sticker */}
        <View style={styles.toolbarIcons}>
          <TouchableOpacity
            style={[
              styles.toolbarIcon,
              activePanel === "emoji" && styles.toolbarIconActive,
            ]}
            onPress={() => {
              inputRef.current?.blur();
              openPanel("emoji");
            }}
          >
            <Text style={styles.toolbarEmoji}>😊</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolbarIcon,
              activePanel === "media" && styles.toolbarIconActive,
            ]}
            onPress={() => {
              inputRef.current?.blur();
              openPanel("media");
            }}
          >
            <Ionicons
              name="image-outline"
              size={18}
              color={
                activePanel === "media"
                  ? theme.colors.teal600
                  : theme.textSecondary
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolbarIcon,
              activePanel === "sticker" && styles.toolbarIconActive,
            ]}
            onPress={() => {
              inputRef.current?.blur();
              openPanel("sticker");
            }}
          >
            <Ionicons
              name="happy-outline"
              size={18}
              color={
                activePanel === "sticker"
                  ? theme.colors.teal600
                  : theme.textSecondary
              }
            />
          </TouchableOpacity>
        </View>

        {/* Send */}
        <TouchableOpacity
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          onPress={handleSubmit}
          disabled={!canSend}
        >
          <Ionicons
            name="send"
            size={16}
            color={canSend ? theme.colors.white : theme.colors.gray200}
          />
        </TouchableOpacity>
      </View>

      {/* Anonymous label */}
      {isAnonymous && (
        <View style={styles.anonBadge}>
          <Ionicons
            name="shield-checkmark"
            size={11}
            color={theme.colors.teal600}
          />
          <Text style={styles.anonBadgeText}>
            Posting anonymously — your identity is protected
          </Text>
        </View>
      )}

      {/* ── Expandable panel ── */}
      <Animated.View
        style={[styles.panel, { height: panelHeightPx, opacity: panelOpacity }]}
      >
        {/* Emoji panel */}
        {activePanel === "emoji" && (
          <View style={styles.panelInner}>
            <View style={styles.emojiPageTabs}>
              {(["😂", "👍", "😍"] as const).map((tab, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.emojiPageTab,
                    emojiPage === i && styles.emojiPageTabActive,
                  ]}
                  onPress={() => setEmojiPage(i as EmojiPage)}
                >
                  <Text style={styles.emojiTabText}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.emojiGrid}>
              {EMOJI_SETS[emojiPage].map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.emojiCell}
                  onPress={() => appendEmoji(emoji)}
                >
                  <Text style={styles.emojiGlyph}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Media panel */}
        {activePanel === "media" && (
          <View style={styles.panelInner}>
            <Text style={styles.panelHint}>
              Attach an image or short video clip
            </Text>
            <View style={styles.mediaGrid}>
              <TouchableOpacity
                style={styles.mediaCell}
                onPress={pickMedia}
              >
                <Ionicons
                  name="images-outline"
                  size={22}
                  color={theme.colors.teal600}
                />
                <Text style={styles.mediaCellLabel}>Gallery</Text>
              </TouchableOpacity>
              {/* Camera shortcut */}
              <TouchableOpacity
                style={styles.mediaCellCamera}
                onPress={async () => {
                  const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images', 'videos'],
                    allowsEditing: true,
                    quality: 0.8,
                  });

                  if (!result.canceled && result.assets[0]) {
                    const asset = result.assets[0];
                    const type = asset.type === 'video' ? 'video' : 'image';
                    
                    const validation = await validateMedia(
                      asset.uri,
                      type,
                      asset.fileSize ?? undefined,
                      asset.duration ?? undefined
                    );
                    if (!validation.valid) {
                      Alert.alert("Cannot attach media", validation.error);
                      return;
                    }
                    
                    setAttachments([{
                      id: Date.now().toString(),
                      type,
                      uri: asset.uri,
                      fileSize: asset.fileSize ?? undefined,
                      duration: asset.duration ?? undefined,
                    }]);
                  }
                }}
              >
                <Ionicons
                  name="camera-outline"
                  size={22}
                  color={theme.colors.teal600}
                />
                <Text style={styles.mediaCellCameraLabel}>Camera</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Sticker panel */}
        {activePanel === "sticker" && (
          <View style={styles.panelInner}>
            <Text style={styles.panelHint}>Sri Lanka community stickers</Text>
            <View style={styles.stickerGrid}>
              {STICKERS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.stickerCell}
                  onPress={() => appendEmoji(s)}
                >
                  <Text style={styles.stickerGlyph}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderTopColor: theme.borderDefault,
    backgroundColor: theme.backgroundPrimary,
  },

  // Reply banner
  replyBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.teal50,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.teal100,
  },
  replyBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  replyAccent: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: theme.colors.teal600,
    marginRight: 2,
  },
  replyText: {
    fontSize: theme.fontSize.xs,
    color: theme.textSecondary,
  },
  replyName: {
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.teal600,
  },
  replyClose: {
    padding: 4,
  },

  // Attachment chips
  attachmentScroll: {
    maxHeight: 40,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderDefault,
  },
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    gap: 6,
    paddingVertical: 6,
  },
  attachmentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: theme.colors.teal50,
    borderWidth: 1,
    borderColor: theme.colors.teal100,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  attachmentLabel: {
    fontSize: 11,
    color: theme.colors.teal600,
    fontWeight: theme.fontWeight.medium,
  },

  // Input row
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  anonAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.backgroundSecondary,
    borderWidth: 1.5,
    borderColor: theme.borderDefault,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  anonAvatarActive: {
    backgroundColor: theme.colors.teal50,
    borderColor: theme.colors.teal400,
  },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 96,
    backgroundColor: theme.backgroundSecondary,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 9,
    fontSize: theme.fontSize.sm,
    color: theme.textPrimary,
  },
  toolbarIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginBottom: 2,
  },
  toolbarIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  toolbarIconActive: {
    backgroundColor: theme.colors.teal50,
  },
  toolbarEmoji: {
    fontSize: 18,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.teal600,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.gray100,
  },

  // Anonymous badge
  anonBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  anonBadgeText: {
    fontSize: 11,
    color: theme.colors.teal600,
    fontWeight: theme.fontWeight.medium,
  },

  // Expandable panel
  panel: {
    overflow: "hidden",
    backgroundColor: theme.backgroundPrimary,
    borderTopWidth: 1,
    borderTopColor: theme.borderDefault,
  },
  panelInner: {
    padding: theme.spacing.md,
  },
  panelHint: {
    fontSize: 11,
    color: theme.textTertiary,
    marginBottom: theme.spacing.sm,
  },

  // Emoji
  emojiPageTabs: {
    flexDirection: "row",
    gap: 6,
    marginBottom: theme.spacing.sm,
  },
  emojiPageTab: {
    width: 36,
    height: 30,
    borderRadius: theme.radius.md,
    backgroundColor: theme.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiPageTabActive: {
    backgroundColor: theme.colors.teal50,
    borderWidth: 1,
    borderColor: theme.colors.teal100,
  },
  emojiTabText: {
    fontSize: 16,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  emojiCell: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiGlyph: {
    fontSize: 22,
  },

  // Media
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  mediaCell: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.backgroundSecondary,
    borderWidth: 1.5,
    borderColor: theme.borderDefault,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    position: "relative",
  },
  mediaCellSelected: {
    borderColor: theme.colors.teal400,
    backgroundColor: theme.colors.teal50,
  },
  mediaCellLabel: {
    fontSize: 10,
    color: theme.textTertiary,
    fontWeight: theme.fontWeight.medium,
  },
  videoTag: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: theme.colors.primary400,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  videoTagText: {
    fontSize: 9,
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
  },
  mediaCheckmark: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.teal600,
    alignItems: "center",
    justifyContent: "center",
  },
  mediaCellCamera: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.teal200,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  mediaCellCameraLabel: {
    fontSize: 10,
    color: theme.colors.teal600,
    fontWeight: theme.fontWeight.medium,
  },

  // Stickers
  stickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  stickerCell: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.borderDefault,
  },
  stickerGlyph: {
    fontSize: 26,
  },
});
