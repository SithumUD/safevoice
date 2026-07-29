package com.sithum.safevoice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableJpaRepositories(basePackages = "com.sithum.safevoice.repository")
@EnableRedisRepositories(basePackages = {})
public class SafevoiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(SafevoiceApplication.class, args);
	}

}
