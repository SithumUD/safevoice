package com.sithum.safevoice.service;

import com.sithum.safevoice.dto.response.AvatarOptionDTO;
import com.sithum.safevoice.dto.response.MediaUploadResponseDTO;
import com.sithum.safevoice.dto.response.UploadSignatureResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service interface managing Cloudinary media operations, safety moderation checks, and avatar choices.
 */
public interface CloudinaryService {

    /**
     * Uploads a multipart media file (image/video) directly to Cloudinary CDN with safety moderation checks.
     */
    MediaUploadResponseDTO uploadFile(MultipartFile file, String folder);

    /**
     * Generates signed authentication parameters for direct client-side upload to Cloudinary.
     */
    UploadSignatureResponseDTO generateUploadSignature(String folder);

    /**
     * Deletes a media asset from Cloudinary CDN by its public ID.
     */
    boolean deleteFile(String publicId);

    /**
     * Returns the curated catalog of default platform avatar choices available for user profiles.
     */
    List<AvatarOptionDTO> getDefaultAvatars();
}
