package com.sithum.safevoice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when Cloudinary file upload or signature generation fails.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class MediaUploadException extends RuntimeException {

    public MediaUploadException(String message) {
        super(message);
    }

    public MediaUploadException(String message, Throwable cause) {
        super(message, cause);
    }
}
