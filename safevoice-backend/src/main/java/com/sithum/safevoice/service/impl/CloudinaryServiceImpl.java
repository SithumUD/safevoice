package com.sithum.safevoice.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.sithum.safevoice.config.CloudinaryProperties;
import com.sithum.safevoice.dto.response.AvatarOptionDTO;
import com.sithum.safevoice.dto.response.MediaUploadResponseDTO;
import com.sithum.safevoice.dto.response.UploadSignatureResponseDTO;
import com.sithum.safevoice.enums.MediaType;
import com.sithum.safevoice.exception.MediaUploadException;
import com.sithum.safevoice.service.CloudinaryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Implementation of {@link CloudinaryService} incorporating automated content safety moderation
 * (nudity/violence prevention) and pre-curated default avatar catalogs.
 */
@Slf4j
@Service
public class CloudinaryServiceImpl implements CloudinaryService {

    private static final long MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024L; // 10 MB
    private static final long MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024L; // 50 MB

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private static final Set<String> ALLOWED_VIDEO_TYPES = Set.of(
            "video/mp4", "video/quicktime", "video/webm"
    );

    private final Cloudinary cloudinary;
    private final CloudinaryProperties cloudinaryProperties;

    public CloudinaryServiceImpl(Cloudinary cloudinary, CloudinaryProperties cloudinaryProperties) {
        this.cloudinary = cloudinary;
        this.cloudinaryProperties = cloudinaryProperties;
    }

    @Override
    @SuppressWarnings("unchecked")
    public MediaUploadResponseDTO uploadFile(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new MediaUploadException("File to upload cannot be null or empty.");
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new MediaUploadException("Could not determine media content type.");
        }

        boolean isImage = ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase());
        boolean isVideo = ALLOWED_VIDEO_TYPES.contains(contentType.toLowerCase());

        if (!isImage && !isVideo) {
            throw new MediaUploadException("Unsupported media format '" + contentType + "'. Only JPEG, PNG, WEBP, GIF, MP4, MOV, and WEBM are allowed.");
        }

        if (isImage && file.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new MediaUploadException("Image size exceeds maximum limit of 10MB.");
        }
        if (isVideo && file.getSize() > MAX_VIDEO_SIZE_BYTES) {
            throw new MediaUploadException("Video size exceeds maximum limit of 50MB.");
        }

        String targetFolder = (folder != null && !folder.isBlank()) ? folder : "safevoice/topics";
        MediaType mediaType = isVideo ? MediaType.VIDEO : MediaType.IMAGE;

        try {
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", targetFolder,
                    "resource_type", isVideo ? "video" : "image",
                    "moderation", "aws_rek:nudity:explicit_nudity:suggestive:violence"
            );

            // Apply transformations depending on target folder
            if ("topics".equalsIgnoreCase(folder)) {
                uploadParams.put("transformation", "c_limit,w_1200,h_1200,f_auto,q_auto");
            } else if ("comments".equalsIgnoreCase(folder)) {
                uploadParams.put("transformation", "c_limit,w_800,h_800,f_auto,q_auto");
            }

            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);

            // Check automated safety moderation status
            if (uploadResult.containsKey("moderation")) {
                List<Map<String, Object>> moderationList = (List<Map<String, Object>>) uploadResult.get("moderation");
                if (moderationList != null) {
                    for (Map<String, Object> modItem : moderationList) {
                        String modStatus = (String) modItem.get("status");
                        if ("rejected".equalsIgnoreCase(modStatus)) {
                            String publicId = (String) uploadResult.get("public_id");
                            if (publicId != null) {
                                deleteFile(publicId);
                            }
                            throw new MediaUploadException("Uploaded media failed safety moderation checks (explicit nudity, adult content, or graphic violence detected).");
                        }
                    }
                }
            }

            String secureUrl = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");
            Integer width = uploadResult.get("width") != null ? ((Number) uploadResult.get("width")).intValue() : null;
            Integer height = uploadResult.get("height") != null ? ((Number) uploadResult.get("height")).intValue() : null;
            String format = (String) uploadResult.get("format");
            Long bytes = uploadResult.get("bytes") != null ? ((Number) uploadResult.get("bytes")).longValue() : file.getSize();

            log.info("Successfully uploaded media asset to Cloudinary. Public ID: {}, URL: {}", publicId, secureUrl);

            return MediaUploadResponseDTO.builder()
                    .url(secureUrl)
                    .publicId(publicId)
                    .mediaType(mediaType)
                    .width(width)
                    .height(height)
                    .format(format)
                    .bytes(bytes)
                    .build();

        } catch (IOException e) {
            log.error("Failed to upload media file to Cloudinary: {}", e.getMessage(), e);
            throw new MediaUploadException("Could not upload file to Cloudinary: " + e.getMessage(), e);
        }
    }

    @Override
    public UploadSignatureResponseDTO generateUploadSignature(String folder) {
        long timestamp = System.currentTimeMillis() / 1000L;
        String targetFolder = (folder != null && !folder.isBlank()) ? folder : "safevoice/topics";

        Map<String, Object> paramsToSign = new HashMap<>();
        paramsToSign.put("timestamp", timestamp);
        paramsToSign.put("folder", targetFolder);
        paramsToSign.put("moderation", "aws_rek:nudity:explicit_nudity:suggestive:violence");

        if (cloudinaryProperties.getUploadPreset() != null && !cloudinaryProperties.getUploadPreset().isBlank()) {
            paramsToSign.put("upload_preset", cloudinaryProperties.getUploadPreset());
        }

        String signature = cloudinary.apiSignRequest(paramsToSign, cloudinaryProperties.getApiSecret());

        return UploadSignatureResponseDTO.builder()
                .timestamp(timestamp)
                .signature(signature)
                .apiKey(cloudinaryProperties.getApiKey())
                .cloudName(cloudinaryProperties.getCloudName())
                .folder(targetFolder)
                .uploadPreset(cloudinaryProperties.getUploadPreset())
                .build();
    }

    @Override
    public boolean deleteFile(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            return false;
        }

        try {
            Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            String status = (String) result.get("result");
            return "ok".equalsIgnoreCase(status);
        } catch (IOException e) {
            log.error("Failed to delete media asset from Cloudinary: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public List<AvatarOptionDTO> getDefaultAvatars() {
        return Arrays.asList(
                new AvatarOptionDTO("av_01", "Community Shield", "https://res.cloudinary.com/safevoice-app/image/upload/v1/avatars/defaults/shield.png", "CIVIC"),
                new AvatarOptionDTO("av_02", "Voice Speaker", "https://res.cloudinary.com/safevoice-app/image/upload/v1/avatars/defaults/speaker.png", "CIVIC"),
                new AvatarOptionDTO("av_03", "Anonymous Guardian", "https://res.cloudinary.com/safevoice-app/image/upload/v1/avatars/defaults/guardian.png", "SAFETY"),
                new AvatarOptionDTO("av_04", "City Tree", "https://res.cloudinary.com/safevoice-app/image/upload/v1/avatars/defaults/tree.png", "COMMUNITY"),
                new AvatarOptionDTO("av_05", "Public Policy", "https://res.cloudinary.com/safevoice-app/image/upload/v1/avatars/defaults/policy.png", "GENERAL"),
                new AvatarOptionDTO("av_06", "Education Owl", "https://res.cloudinary.com/safevoice-app/image/upload/v1/avatars/defaults/owl.png", "EDUCATION"),
                new AvatarOptionDTO("av_07", "Civic Flame", "https://res.cloudinary.com/safevoice-app/image/upload/v1/avatars/defaults/flame.png", "CIVIC"),
                new AvatarOptionDTO("av_08", "Neighborhood Star", "https://res.cloudinary.com/safevoice-app/image/upload/v1/avatars/defaults/star.png", "COMMUNITY")
        );
    }
}
