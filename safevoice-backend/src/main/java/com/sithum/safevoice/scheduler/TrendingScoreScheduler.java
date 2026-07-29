package com.sithum.safevoice.scheduler;

import com.sithum.safevoice.entity.Topic;
import com.sithum.safevoice.enums.TopicStatus;
import com.sithum.safevoice.repository.TopicRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

/**
 * Periodically recalculates trending scores for active topics
 * and updates their {@code is_trending} flag in the database.
 */
@Component
public class TrendingScoreScheduler {

    private static final Logger log = LoggerFactory.getLogger(TrendingScoreScheduler.class);

    private final TopicRepository topicRepository;

    public TrendingScoreScheduler(TopicRepository topicRepository) {
        this.topicRepository = topicRepository;
    }

    /**
     * Recalibrates trending scores every 15 minutes.
     */
    @Scheduled(fixedRate = 900_000)
    @Transactional
    public void recalibrateTrendingScores() {
        log.info("Starting trending score recalibration...");
        Instant now = Instant.now();

        // Fetch active topics
        List<Topic> activeTopics = topicRepository.findByStatus(TopicStatus.ACTIVE, PageRequest.of(0, 500)).getContent();

        int trendingCount = 0;
        for (Topic topic : activeTopics) {
            double ageHours = Math.max(1.0, Duration.between(topic.getCreatedAt(), now).toMinutes() / 60.0);
            double score = (topic.getLikes() * 2.0 + topic.getCommentCount() * 1.5 + topic.getViews() * 0.5)
                    / Math.pow(ageHours + 2.0, 1.5);

            boolean shouldBeTrending = score >= 2.0 && ageHours <= 168.0; // score threshold and within 7 days
            if (!topic.getIsTrending().equals(shouldBeTrending)) {
                topic.setIsTrending(shouldBeTrending);
                topicRepository.save(topic);
            }

            if (shouldBeTrending) {
                trendingCount++;
            }
        }

        log.info("Trending score recalibration completed. Found {} trending topics out of {} active topics.",
                trendingCount, activeTopics.size());
    }
}
