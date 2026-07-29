package com.sithum.safevoice.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * Startup schema patch runner ensuring database constraints allow standalone polls.
 */
@Slf4j
@Configuration
public class DatabaseSchemaMigrationConfig {

    @Bean
    public CommandLineRunner dropPollTopicIdNotNullConstraint(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE polls ALTER COLUMN topic_id DROP NOT NULL");
                log.info("Successfully ensured polls.topic_id column is nullable for standalone polls.");
            } catch (Exception ex) {
                log.warn("Schema patch on polls.topic_id completed with notice: {}", ex.getMessage());
            }
        };
    }
}
