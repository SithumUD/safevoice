package com.sithum.safevoice.dto.request;

import java.util.List;
import java.util.UUID;

/**
 * Body for {@code POST /api/v1/auth/convert-guest} — transfers a guest's
 * locally-held bookmarks/preferences onto the newly authenticated account
 * (Spec Section 5.1, item 4).
 */
public record ConvertGuestRequest(

        List<UUID> guestSavedTopicIds,

        List<UUID> guestReadGlobalNotificationIds
) {
    public ConvertGuestRequest {
        if (guestSavedTopicIds == null) {
            guestSavedTopicIds = List.of();
        }
        if (guestReadGlobalNotificationIds == null) {
            guestReadGlobalNotificationIds = List.of();
        }
    }
}
