// src/screens/TopicDetail/components/CommentThread.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { useVideoCache } from "../../../hooks/useVideoCache";
import { memo, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Avatar from "../../../components/Avatar";

import { theme } from "../../../theme";
import { Comment } from "../../../types/models";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

function getOptimizedMediaUrl(
  url: string | null | undefined,
  type: "image" | "video",
  getThumbnail = false,
): string | undefined {
  if (!url) return undefined;
  if (!url.includes("cloudinary.com")) return url;

  const transform = "q_auto,f_auto,w_500";
  const urlParts = url.split("/upload/");
  if (urlParts.length !== 2) return url;

  let result = `${urlParts[0]}/upload/${transform}/${urlParts[1]}`;

  if (type === "video" && getThumbnail) {
    result = result.replace(/\.[^/.]+$/, ".jpg");
  }

  return result;
}

// ─── Fullscreen image viewer ──────────────────────────────────────────────────
interface FullscreenImageProps {
  uri: string;
  visible: boolean;
  onClose: () => void;
}

function FullscreenImageModal({ uri, visible, onClose }: FullscreenImageProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar hidden />
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={fsStyles.backdrop}>
          {/* Tap on image itself also closes */}
          <TouchableWithoutFeedback onPress={onClose}>
            <Image
              source={{ uri }}
              style={fsStyles.image}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </TouchableWithoutFeedback>

          {/* Close button */}
          <TouchableOpacity
            style={fsStyles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={fsStyles.closeCircle}>
              <Ionicons name="close" size={20} color={theme.colors.white} />
            </View>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const fsStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.96)",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  closeButton: {
    position: "absolute",
    top: 52,
    right: 18,
    zIndex: 10,
  },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
});

// ─── CommentThread ────────────────────────────────────────────────────────────
interface CommentThreadProps {
  comment: Comment;
  onReply: (comment: Comment) => void;
  onReport: (comment: Comment) => void;
  onReaction?: (commentId: string, reactionType: 'LIKE' | 'DISLIKE') => void;
  isTopLevel?: boolean;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default memo(function CommentThread({
  comment,
  onReply,
  onReport,
  onReaction,
  isTopLevel = true,
}: CommentThreadProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [liked, setLiked] = useState(comment.userReaction === "like");
  const [disliked, setDisliked] = useState(comment.userReaction === "dislike");
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    setLiked(comment.userReaction === "like");
    setDisliked(comment.userReaction === "dislike");
  }, [comment.userReaction]);

  const { localUri } = useVideoCache(comment.mediaType === "video" ? comment.mediaUrl : null, isVideoPlaying);

  const player = useVideoPlayer(
    localUri || (comment.mediaType === "video" ? comment.mediaUrl || "" : ""),
    (player) => {
      player.loop = true;
    },
  );

  const hasReplies = comment.replies && comment.replies.length > 0;
  const replyCount = comment.replies?.length ?? 0;

  const displayedLikes =
    comment.likes +
    (liked && comment.userReaction !== "like" ? 1 : 0) -
    (!liked && comment.userReaction === "like" ? 1 : 0);

  const displayedDislikes =
    comment.dislikes +
    (disliked && comment.userReaction !== "dislike" ? 1 : 0) -
    (!disliked && comment.userReaction === "dislike" ? 1 : 0);

  const authorLabel = comment.isAnonymous
    ? `Anon · ${comment.anonymousId?.slice(-4) ?? "????"}`
    : comment.authorNickname;

  return (
    <View style={[styles.wrapper, !isTopLevel && styles.wrapperNested]}>
      {/* Thread connector line for nested comments */}
      {!isTopLevel && <View style={styles.threadLine} />}

      <View style={styles.card}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Avatar
            initials={
              comment.isAnonymous
                ? "?"
                : comment.authorNickname.slice(0, 2).toUpperCase()
            }
            isAnonymous={comment.isAnonymous}
            size={30}
          />

          <View style={styles.authorBlock}>
            <View style={styles.authorRow}>
              <Text
                style={[
                  styles.authorName,
                  comment.isAnonymous && styles.authorNameAnon,
                ]}
                numberOfLines={1}
              >
                {authorLabel}
              </Text>
              {comment.isAnonymous && (
                <View style={styles.anonBadge}>
                  <Ionicons
                    name="eye-off"
                    size={9}
                    color={theme.anonymousText}
                  />
                  <Text style={styles.anonBadgeText}>anonymous</Text>
                </View>
              )}
            </View>
            <Text style={styles.timestamp}>{timeAgo(comment.createdAt)}</Text>
          </View>

          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => onReport(comment)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={15}
              color={theme.textTertiary}
            />
          </TouchableOpacity>
        </View>

        {/* ── Body ── */}
        <Text style={styles.body}>{comment.body}</Text>

        {/* ── Image media ── */}
        {comment.mediaUrl && comment.mediaType === "image" && (
          <View style={styles.mediaContainer}>
            {/* Tapping the image opens fullscreen viewer */}
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() =>
                !comment.isUploading &&
                setFullscreenImage(
                  getOptimizedMediaUrl(comment.mediaUrl, "image") ?? null,
                )
              }
            >
              <Image
                source={{
                  uri: getOptimizedMediaUrl(comment.mediaUrl, "image"),
                }}
                style={styles.mediaImage}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
              {/* Expand hint icon — bottom-right corner */}
              {!comment.isUploading && (
                <View style={styles.expandHint}>
                  <Ionicons
                    name="expand-outline"
                    size={14}
                    color={theme.colors.white}
                  />
                </View>
              )}
            </TouchableOpacity>

            {comment.isUploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color={theme.colors.white} />
                <Text style={styles.uploadingText}>Uploading image…</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Video media ── */}
        {comment.mediaUrl && comment.mediaType === "video" && (
          <View style={styles.mediaContainer}>
            {isVideoPlaying || comment.isUploading ? (
              <VideoView
                player={player}
                style={styles.mediaVideo}
              />
            ) : (
              // Thumbnail + centered play button
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.videoThumbWrapper}
                onPress={() => {
                  setIsVideoPlaying(true);
                  player.play();
                }}
              >
                <Image
                  source={{
                    uri: getOptimizedMediaUrl(comment.mediaUrl, "video", true),
                  }}
                  style={styles.mediaVideo}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
                {/* Dark scrim */}
                <View style={styles.videoScrim} />
                {/* Play button — truly centered */}
                <View style={styles.playButtonCenter}>
                  <View style={styles.playButtonCircle}>
                    <Ionicons
                      name="play"
                      size={28}
                      color={theme.colors.white}
                      style={{ marginLeft: 3 }} // optical nudge for play triangle
                    />
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {comment.isUploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color={theme.colors.white} />
                <Text style={styles.uploadingText}>Uploading video…</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Action bar ── */}
        <View style={styles.actionBar}>
          {/* Like */}
          <TouchableOpacity
            style={[styles.actionChip, liked && styles.actionChipLiked]}
            onPress={() => {
              setLiked((v) => !v);
              if (disliked) setDisliked(false);
              onReaction?.(comment.id, "LIKE");
            }}
            activeOpacity={0.75}
          >
            <Ionicons
              name={liked ? "thumbs-up" : "thumbs-up-outline"}
              size={13}
              color={liked ? theme.agreeText : theme.textTertiary}
            />
            <Text
              style={[
                styles.actionChipText,
                liked && styles.actionChipTextLiked,
              ]}
            >
              {displayedLikes}
            </Text>
          </TouchableOpacity>

          {/* Dislike */}
          <TouchableOpacity
            style={[styles.actionChip, disliked && styles.actionChipDisliked]}
            onPress={() => {
              setDisliked((v) => !v);
              if (liked) setLiked(false);
              onReaction?.(comment.id, "DISLIKE");
            }}
            activeOpacity={0.75}
          >
            <Ionicons
              name={disliked ? "thumbs-down" : "thumbs-down-outline"}
              size={13}
              color={disliked ? theme.disagreeText : theme.textTertiary}
            />
            <Text
              style={[
                styles.actionChipText,
                disliked && styles.actionChipTextDisliked,
              ]}
            >
              {displayedDislikes}
            </Text>
          </TouchableOpacity>

          <View style={styles.dot} />

          {/* Reply */}
          <TouchableOpacity
            style={styles.replyButton}
            onPress={() => onReply(comment)}
            activeOpacity={0.75}
          >
            <Ionicons
              name="arrow-undo-outline"
              size={13}
              color={theme.colors.teal600}
            />
            <Text style={styles.replyButtonText}>Reply</Text>
          </TouchableOpacity>

          {/* Collapse toggle */}
          {hasReplies && (
            <>
              <View style={styles.dot} />
              <TouchableOpacity
                style={styles.collapseButton}
                onPress={() => setCollapsed((c) => !c)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={
                    collapsed
                      ? "chevron-down-circle-outline"
                      : "chevron-up-circle-outline"
                  }
                  size={13}
                  color={theme.textTertiary}
                />
                <Text style={styles.collapseText}>
                  {collapsed
                    ? `${replyCount} ${replyCount === 1 ? "reply" : "replies"}`
                    : "Collapse"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* ── Nested replies ── */}
      {hasReplies && !collapsed && (
        <View style={styles.repliesBlock}>
          {comment.replies!.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onReport={onReport}
              isTopLevel={false}
            />
          ))}
        </View>
      )}

      {/* ── Fullscreen image viewer ── */}
      {fullscreenImage && (
        <FullscreenImageModal
          uri={fullscreenImage}
          visible={!!fullscreenImage}
          onClose={() => setFullscreenImage(null)}
        />
      )}
    </View>
  );
}, areEqual);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.md,
  },
  wrapperNested: {
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },

  threadLine: {
    position: "absolute",
    left: 15,
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: theme.borderDefault,
    zIndex: 0,
  },

  card: {
    backgroundColor: theme.backgroundPrimary,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    padding: theme.spacing.md,
    shadowColor: theme.colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  authorBlock: { flex: 1 },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  authorName: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.textPrimary,
  },
  authorNameAnon: {
    color: theme.anonymousText,
    fontStyle: "italic",
  },
  anonBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(120,90,170,0.08)",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  anonBadgeText: {
    fontSize: 9,
    color: theme.anonymousText,
    fontWeight: theme.fontWeight.medium,
    letterSpacing: 0.2,
  },
  timestamp: {
    fontSize: 11,
    color: theme.textTertiary,
    marginTop: 1,
  },
  moreButton: {
    padding: 4,
    alignSelf: "flex-start",
  },

  body: {
    fontSize: theme.fontSize.sm,
    color: theme.textPrimary,
    lineHeight: 21,
    marginBottom: 12,
  },

  // ── Media ──
  mediaContainer: {
    marginTop: theme.spacing.sm,
    marginBottom: 4,
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  mediaImage: {
    width: "100%",
    height: 200,
    borderRadius: theme.radius.md,
    backgroundColor: theme.backgroundSecondary,
  },
  // Small expand icon hint in the corner of images
  expandHint: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Video
  videoThumbWrapper: {
    width: "100%",
    height: 200,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    // Needed so absolute children are clipped
    position: "relative",
  },
  mediaVideo: {
    width: "100%",
    height: 200,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.black,
  },
  // Semi-transparent dark overlay over thumbnail
  videoScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  // Centered play button — uses absolute + centering trick
  playButtonCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Upload overlay (shared)
  uploadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.radius.md,
  },
  uploadingText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: theme.fontWeight.medium,
    marginTop: 8,
  },

  // ── Action bar ──
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.borderDefault,
  },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    backgroundColor: theme.backgroundSecondary,
  },
  actionChipLiked: {
    backgroundColor: theme.agreeLight,
    borderColor: theme.colors.green100,
  },
  actionChipDisliked: {
    backgroundColor: theme.disagreeLight,
    borderColor: theme.colors.red100,
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: theme.fontWeight.medium,
    color: theme.textTertiary,
  },
  actionChipTextLiked: { color: theme.agreeText },
  actionChipTextDisliked: { color: theme.disagreeText },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.borderDefault,
    marginHorizontal: 2,
  },
  replyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.teal100,
    backgroundColor: theme.colors.teal50,
  },
  replyButtonText: {
    fontSize: 12,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.teal600,
  },
  collapseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  collapseText: {
    fontSize: 12,
    color: theme.textTertiary,
    fontWeight: theme.fontWeight.medium,
  },

  // ── Replies ──
  repliesBlock: {
    marginLeft: 18,
    marginTop: 4,
    paddingLeft: 14,
    borderLeftWidth: 1.5,
    borderLeftColor: theme.colors.teal100,
  },
});

function areEqual(prevProps: any, nextProps: any) {
  return (
    prevProps.comment.id === nextProps.comment.id &&
    prevProps.comment.likes === nextProps.comment.likes &&
    prevProps.comment.dislikes === nextProps.comment.dislikes &&
    prevProps.comment.userReaction === nextProps.comment.userReaction &&
    prevProps.comment.replies?.length === nextProps.comment.replies?.length &&
    prevProps.comment.isUploading === nextProps.comment.isUploading
  );
}
