package com.sithum.safevoice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a user attempts to vote on a closed or expired poll.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class PollClosedException extends RuntimeException {

    public PollClosedException(String message) {
        super(message);
    }
}
