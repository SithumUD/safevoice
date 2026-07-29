package com.sithum.safevoice.dto.response;

import com.sithum.safevoice.enums.MediaType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object returned upon successful file upload to Cloudinary.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaUploadResponseDTO {

    private String url;
    private String publicId;
    private MediaType mediaType;
    private Integer width;
    private Integer height;
    private String format;
    private Long bytes;
}
