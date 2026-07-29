package com.sithum.safevoice.mapper;

import com.sithum.safevoice.dto.response.UserResponseDTO;
import com.sithum.safevoice.dto.response.UserSummaryDTO;
import com.sithum.safevoice.entity.User;
import org.springframework.stereotype.Component;

/**
 * Mapper utility for converting {@link User} entity domain models into public DTO representations.
 */
@Component
public class UserMapper {

    public UserResponseDTO toUserResponseDTO(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getAvatarUrl(),
                user.getRole(),
                user.getStatus(),
                user.getCommentsCount(),
                user.getLikesReceived(),
                user.getPollVotesCount(),
                user.getMemberSince(),
                user.getLastLoginAt()
        );
    }

    public UserSummaryDTO toUserSummaryDTO(User user) {
        if (user == null) {
            return null;
        }
        return new UserSummaryDTO(
                user.getId(),
                user.getNickname(),
                user.getAvatarUrl()
        );
    }
}
