package com.sithum.safevoice.initializer;

import com.sithum.safevoice.config.AdminSeedProperties;
import com.sithum.safevoice.entity.User;
import com.sithum.safevoice.enums.UserRole;
import com.sithum.safevoice.enums.UserStatus;
import com.sithum.safevoice.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Startup seeder component that initializes the default Super Admin user account
 * if seeding is enabled and no super admin matching configured email/nickname exists.
 */
@Slf4j
@Component
public class SuperAdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminSeedProperties adminSeedProperties;

    public SuperAdminSeeder(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AdminSeedProperties adminSeedProperties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminSeedProperties = adminSeedProperties;
    }

    @Override
    public void run(String... args) {
        if (!adminSeedProperties.isEnabled()) {
            log.info("Super admin user startup seeding is disabled.");
            return;
        }

        String email = adminSeedProperties.getEmail();
        String nickname = adminSeedProperties.getNickname();

        if (userRepository.existsByEmail(email)) {
            log.info("Super admin user with email '{}' already exists. Skipping startup seeding.", email);
            return;
        }

        if (userRepository.existsByNickname(nickname)) {
            log.warn("Cannot seed super admin: nickname '{}' is already taken by another account.", nickname);
            return;
        }

        User superAdmin = new User();
        superAdmin.setEmail(email);
        superAdmin.setPasswordHash(passwordEncoder.encode(adminSeedProperties.getPassword()));
        superAdmin.setNickname(nickname);
        superAdmin.setBio(adminSeedProperties.getBio());
        superAdmin.setRole(UserRole.ADMIN);
        superAdmin.setStatus(UserStatus.ACTIVE);
        superAdmin.setMemberSince(Instant.now());
        superAdmin.setLastLoginAt(Instant.now());

        User savedAdmin = userRepository.save(superAdmin);
        log.info("Successfully seeded super admin user: ID={}, email={}, nickname={}, role={}",
                savedAdmin.getId(), savedAdmin.getEmail(), savedAdmin.getNickname(), savedAdmin.getRole());
    }
}
