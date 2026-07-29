package com.sithum.safevoice.service.impl;

import com.sithum.safevoice.config.JwtProperties;
import com.sithum.safevoice.dto.request.ConvertGuestRequest;
import com.sithum.safevoice.dto.request.LoginRequest;
import com.sithum.safevoice.dto.request.RefreshTokenRequest;
import com.sithum.safevoice.dto.request.RegisterRequest;
import com.sithum.safevoice.dto.response.AccessTokenResponse;
import com.sithum.safevoice.dto.response.JwtResponse;
import com.sithum.safevoice.dto.response.UserResponseDTO;
import com.sithum.safevoice.entity.GlobalNotification;
import com.sithum.safevoice.entity.SavedTopic;
import com.sithum.safevoice.entity.Topic;
import com.sithum.safevoice.entity.User;
import com.sithum.safevoice.entity.UserReadGlobalNotification;
import com.sithum.safevoice.enums.UserRole;
import com.sithum.safevoice.enums.UserStatus;
import com.sithum.safevoice.exception.AccountStatusException;
import com.sithum.safevoice.exception.InvalidCredentialsException;
import com.sithum.safevoice.exception.InvalidTokenException;
import com.sithum.safevoice.exception.ResourceNotFoundException;
import com.sithum.safevoice.exception.UserAlreadyExistsException;
import com.sithum.safevoice.mapper.UserMapper;
import com.sithum.safevoice.repository.GlobalNotificationRepository;
import com.sithum.safevoice.repository.SavedTopicRepository;
import com.sithum.safevoice.repository.TopicRepository;
import com.sithum.safevoice.repository.UserRepository;
import com.sithum.safevoice.repository.UserReadGlobalNotificationRepository;
import com.sithum.safevoice.security.JwtTokenProvider;
import com.sithum.safevoice.security.UserPrincipal;
import com.sithum.safevoice.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Implementation of {@link AuthService} managing user authentication, token persistence, and Redis session control.
 */
@Slf4j
@Service
public class AuthServiceImpl implements AuthService {

    private static final String REDIS_SESSION_PREFIX = "session:";

    private final UserRepository userRepository;
    private final TopicRepository topicRepository;
    private final GlobalNotificationRepository globalNotificationRepository;
    private final SavedTopicRepository savedTopicRepository;
    private final UserReadGlobalNotificationRepository userReadGlobalNotificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final JwtProperties jwtProperties;
    private final StringRedisTemplate stringRedisTemplate;
    private final UserMapper userMapper;
    private final com.sithum.safevoice.service.EmailService emailService;

    public AuthServiceImpl(
            UserRepository userRepository,
            TopicRepository topicRepository,
            GlobalNotificationRepository globalNotificationRepository,
            SavedTopicRepository savedTopicRepository,
            UserReadGlobalNotificationRepository userReadGlobalNotificationRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            JwtProperties jwtProperties,
            StringRedisTemplate stringRedisTemplate,
            UserMapper userMapper,
            com.sithum.safevoice.service.EmailService emailService) {
        this.userRepository = userRepository;
        this.topicRepository = topicRepository;
        this.globalNotificationRepository = globalNotificationRepository;
        this.savedTopicRepository = savedTopicRepository;
        this.userReadGlobalNotificationRepository = userReadGlobalNotificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.jwtProperties = jwtProperties;
        this.stringRedisTemplate = stringRedisTemplate;
        this.userMapper = userMapper;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public JwtResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new UserAlreadyExistsException("Email '" + request.email() + "' is already registered.");
        }
        if (userRepository.existsByNickname(request.nickname())) {
            throw new UserAlreadyExistsException("Nickname '" + request.nickname() + "' is already taken.");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setNickname(request.nickname());
        user.setRole(UserRole.USER);
        user.setStatus(UserStatus.ACTIVE);
        user.setMemberSince(Instant.now());
        user.setLastLoginAt(Instant.now());

        User savedUser = userRepository.save(user);

        UserPrincipal userPrincipal = UserPrincipal.create(savedUser);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());

        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(savedUser.getId());

        storeSessionInRedis(savedUser.getId(), refreshToken);

        long expiresInSeconds = jwtProperties.getExpirationMs() / 1000L;
        return new JwtResponse(accessToken, refreshToken, expiresInSeconds, userMapper.toUserResponseDTO(savedUser));
    }

    @Override
    @Transactional
    public JwtResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new AccountStatusException("Your account has been temporarily suspended.");
        }
        if (user.getStatus() == UserStatus.BANNED) {
            throw new AccountStatusException("Your account has been permanently banned.");
        }

        user.setLastLoginAt(Instant.now());
        User updatedUser = userRepository.save(user);

        UserPrincipal userPrincipal = UserPrincipal.create(updatedUser);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());

        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(updatedUser.getId());

        storeSessionInRedis(updatedUser.getId(), refreshToken);

        long expiresInSeconds = jwtProperties.getExpirationMs() / 1000L;
        return new JwtResponse(accessToken, refreshToken, expiresInSeconds, userMapper.toUserResponseDTO(updatedUser));
    }

    @Override
    public AccessTokenResponse refreshToken(String authHeader, RefreshTokenRequest requestBody) {
        String token = extractRefreshToken(authHeader, requestBody);

        if (!tokenProvider.validateToken(token)) {
            throw new InvalidTokenException("Invalid or expired refresh token.");
        }

        UUID userId = tokenProvider.getUserIdFromToken(token);

        String sessionKey = REDIS_SESSION_PREFIX + userId + ":" + token;
        Boolean exists = stringRedisTemplate.hasKey(sessionKey);
        if (exists == null || !exists) {
            throw new InvalidTokenException("Refresh token has been revoked or session expired.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidTokenException("Associated user account no longer exists."));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new AccountStatusException("User account is not active.");
        }

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());

        String newAccessToken = tokenProvider.generateToken(authentication);
        long expiresInSeconds = jwtProperties.getExpirationMs() / 1000L;

        return new AccessTokenResponse(newAccessToken, expiresInSeconds);
    }

    @Override
    public void logout(UUID userId, String authHeader) {
        if (userId == null) {
            return;
        }
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String sessionKey = REDIS_SESSION_PREFIX + userId + ":" + token;
            stringRedisTemplate.delete(sessionKey);
        } else {
            // Delete all sessions for user if specific token header is omitted
            Set<String> keys = stringRedisTemplate.keys(REDIS_SESSION_PREFIX + userId + ":*");
            if (keys != null && !keys.isEmpty()) {
                stringRedisTemplate.delete(keys);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID '" + userId + "' not found."));
        return userMapper.toUserResponseDTO(user);
    }

    @Override
    @Transactional
    public UserResponseDTO convertGuest(UUID userId, ConvertGuestRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID '" + userId + "' not found."));

        if (request.guestSavedTopicIds() != null) {
            for (UUID topicId : request.guestSavedTopicIds()) {
                Optional<Topic> topicOpt = topicRepository.findById(topicId);
                if (topicOpt.isPresent() && !savedTopicRepository.existsByIdUserIdAndIdTopicId(userId, topicId)) {
                    SavedTopic savedTopic = new SavedTopic();
                    savedTopic.setUser(user);
                    savedTopic.setTopic(topicOpt.get());
                    savedTopicRepository.save(savedTopic);
                }
            }
        }

        if (request.guestReadGlobalNotificationIds() != null) {
            for (UUID notifId : request.guestReadGlobalNotificationIds()) {
                Optional<GlobalNotification> notifOpt = globalNotificationRepository.findById(notifId);
                if (notifOpt.isPresent() && !userReadGlobalNotificationRepository.existsByIdUserIdAndIdGlobalNotificationId(userId, notifId)) {
                    UserReadGlobalNotification readNotif = new UserReadGlobalNotification();
                    readNotif.setUser(user);
                    readNotif.setGlobalNotification(notifOpt.get());
                    userReadGlobalNotificationRepository.save(readNotif);
                }
            }
        }

        return userMapper.toUserResponseDTO(user);
    }

    private void storeSessionInRedis(UUID userId, String refreshToken) {
        String sessionKey = REDIS_SESSION_PREFIX + userId + ":" + refreshToken;
        stringRedisTemplate.opsForValue().set(
                sessionKey,
                "ACTIVE",
                jwtProperties.getRefreshExpirationMs(),
                TimeUnit.MILLISECONDS
        );
    }

    private String extractRefreshToken(String authHeader, RefreshTokenRequest requestBody) {
        if (requestBody != null && StringUtils.hasText(requestBody.refreshToken())) {
            return requestBody.refreshToken();
        }
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        throw new InvalidTokenException("Refresh token must be provided in Authorization header or request body.");
    }

    @Override
    public void forgotPassword(com.sithum.safevoice.dto.request.ForgotPasswordRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            log.warn("Forgot password requested for non-existent email: {}", email);
            // Return silently to prevent user enumeration attacks
            return;
        }

        // Generate 6-digit random OTP
        String otp = String.format("%06d", java.util.concurrent.ThreadLocalRandom.current().nextInt(1000000));
        String redisKey = "otp:reset_password:" + email;

        // Store in Redis with 10 minute TTL
        stringRedisTemplate.opsForValue().set(redisKey, otp, 10, TimeUnit.MINUTES);

        // Dispatch via email service
        emailService.sendPasswordResetOtp(userOpt.get().getEmail(), otp);
    }

    @Override
    @Transactional
    public void resetPassword(com.sithum.safevoice.dto.request.ResetPasswordRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        String redisKey = "otp:reset_password:" + email;
        String storedOtp = stringRedisTemplate.opsForValue().get(redisKey);

        if (storedOtp == null || !storedOtp.equals(request.getOtp())) {
            throw new InvalidCredentialsException("Invalid or expired verification code.");
        }

        // Remove OTP from Redis
        stringRedisTemplate.delete(redisKey);

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Invalidate active sessions
        Set<String> sessionKeys = stringRedisTemplate.keys(REDIS_SESSION_PREFIX + user.getId() + ":*");
        if (sessionKeys != null && !sessionKeys.isEmpty()) {
            stringRedisTemplate.delete(sessionKeys);
        }

        log.info("Password successfully reset for user ID {}", user.getId());
    }
}
