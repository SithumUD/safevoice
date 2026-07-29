package com.sithum.safevoice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a user attempts to vote multiple times on the same poll.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateVoteException extends RuntimeException {

    public DuplicateVoteException(String message) {
        super(message);
    }
}
