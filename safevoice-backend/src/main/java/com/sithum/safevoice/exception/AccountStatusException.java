package com.sithum.safevoice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a user account is SUSPENDED or BANNED.
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class AccountStatusException extends RuntimeException {

    public AccountStatusException(String message) {
        super(message);
    }
}
