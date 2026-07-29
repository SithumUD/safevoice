package com.sithum.safevoice.initializer;

import com.sithum.safevoice.config.AdminSeedProperties;
import com.sithum.safevoice.entity.User;
import com.sithum.safevoice.enums.UserRole;
import com.sithum.safevoice.enums.UserStatus;
import com.sithum.safevoice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SuperAdminSeederTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private AdminSeedProperties adminSeedProperties;

    private SuperAdminSeeder superAdminSeeder;

    @BeforeEach
    void setUp() {
        adminSeedProperties = new AdminSeedProperties();
        superAdminSeeder = new SuperAdminSeeder(userRepository, passwordEncoder, adminSeedProperties);
    }

    @Test
    void testRun_SeedsSuperAdminUser_WhenUserDoesNotExist() {
        when(userRepository.existsByEmail("admin@safevoice.com")).thenReturn(false);
        when(userRepository.existsByNickname("SuperAdmin")).thenReturn(false);
        when(passwordEncoder.encode("AdminPassword123!")).thenReturn("encodedPassword123");

        User mockSavedAdmin = new User();
        mockSavedAdmin.setId(UUID.randomUUID());
        mockSavedAdmin.setEmail("admin@safevoice.com");
        mockSavedAdmin.setNickname("SuperAdmin");
        mockSavedAdmin.setRole(UserRole.ADMIN);
        when(userRepository.save(any(User.class))).thenReturn(mockSavedAdmin);

        superAdminSeeder.run();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User createdUser = userCaptor.getValue();
        assertEquals("admin@safevoice.com", createdUser.getEmail());
        assertEquals("SuperAdmin", createdUser.getNickname());
        assertEquals("encodedPassword123", createdUser.getPasswordHash());
        assertEquals(UserRole.ADMIN, createdUser.getRole());
        assertEquals(UserStatus.ACTIVE, createdUser.getStatus());
        assertNotNull(createdUser.getMemberSince());
    }

    @Test
    void testRun_SkipsSeeding_WhenEmailAlreadyExists() {
        when(userRepository.existsByEmail("admin@safevoice.com")).thenReturn(true);

        superAdminSeeder.run();

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRun_SkipsSeeding_WhenNicknameAlreadyExists() {
        when(userRepository.existsByEmail("admin@safevoice.com")).thenReturn(false);
        when(userRepository.existsByNickname("SuperAdmin")).thenReturn(true);

        superAdminSeeder.run();

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRun_SkipsSeeding_WhenDisabled() {
        adminSeedProperties.setEnabled(false);

        superAdminSeeder.run();

        verify(userRepository, never()).existsByEmail(anyString());
        verify(userRepository, never()).save(any(User.class));
    }
}
