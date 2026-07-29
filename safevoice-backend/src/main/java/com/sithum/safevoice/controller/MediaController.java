package com.sithum.safevoice.controller;

import com.sithum.safevoice.dto.response.AvatarOptionDTO;
import com.sithum.safevoice.dto.response.MediaUploadResponseDTO;
import com.sithum.safevoice.dto.response.UploadSignatureResponseDTO;
import com.sithum.safevoice.service.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Spring REST Controller exposing Media & File Storage Endpoints.
 * Spec Section 5.2 & 7.2. Includes safety moderation checks and default avatar choices catalog.
 */
@RestController
@RequestMapping("/api/v1/media")
public class MediaController {

    private final CloudinaryService cloudinaryService;

    public MediaController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    /**
     * POST /api/v1/media/upload
     * Accepts multipart image/video file, validates format/size, applies safety moderation checks, and uploads to Cloudinary CDN.
     */
    @PostMapping("/upload")
    public ResponseEntity<MediaUploadResponseDTO> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false, defaultValue = "topics") String folder) {
        MediaUploadResponseDTO response = cloudinaryService.uploadFile(file, folder);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/media/upload-signature
     * Generates signed authentication parameters for direct client-side upload to Cloudinary CDN with safety moderation filters.
     */
    @GetMapping("/upload-signature")
    public ResponseEntity<UploadSignatureResponseDTO> getUploadSignature(
            @RequestParam(value = "folder", required = false, defaultValue = "topics") String folder) {
        UploadSignatureResponseDTO signatureResponse = cloudinaryService.generateUploadSignature(folder);
        return ResponseEntity.ok(signatureResponse);
    }

    /**
     * DELETE /api/v1/media
     * Deletes a media asset from Cloudinary CDN by its public ID.
     */
    @DeleteMapping
    public ResponseEntity<Map<String, Object>> deleteMedia(@RequestParam("publicId") String publicId) {
        boolean deleted = cloudinaryService.deleteFile(publicId);
        return ResponseEntity.ok(Map.of("publicId", publicId, "deleted", deleted));
    }

    /**
     * GET /api/v1/media/avatars
     * Returns the curated catalog of default platform avatar choices available for user profile selection.
     */
    @GetMapping("/avatars")
    public ResponseEntity<List<AvatarOptionDTO>> getDefaultAvatars() {
        List<AvatarOptionDTO> avatars = cloudinaryService.getDefaultAvatars();
        return ResponseEntity.ok(avatars);
    }
}
