package com.sithum.safevoice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object returned for direct client-side upload signature generation.
 * Spec Section 5.2 & 7.2.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadSignatureResponseDTO {

    private long timestamp;
    private String signature;
    private String apiKey;
    private String cloudName;
    private String folder;
    private String uploadPreset;
}
