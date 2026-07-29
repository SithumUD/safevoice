// src/hooks/useTrendingScore.ts
// Client-side trending label utility.
// The authoritative is_trending flag is set by the backend scheduler.
// This hook adds a granular display label for the UI (Hot / Rising / nothing).

import { useMemo } from 'react';

interface TrendingMetrics {
  likes: number;
  commentCount: number;
  views: number;
  createdAt: string; // ISO date string
  isTrending: boolean;
}

export type TrendingLabel = '🔥 Hot' | '📈 Rising' | null;

export function useTrendingScore(metrics: TrendingMetrics): TrendingLabel {
  return useMemo(() => {
    if (!metrics.isTrending) return null;

    const ageHours = Math.max(
      1,
      (Date.now() - new Date(metrics.createdAt).getTime()) / 3_600_000
    );

    // Wilson-inspired score (same formula as backend scheduler)
    const score =
      (metrics.likes * 2 + metrics.commentCount + metrics.views * 0.5) /
      Math.pow(ageHours + 2, 1.5);

    // "Hot" = very high velocity in last 6 hours
    if (score > 20 && ageHours <= 6) return '🔥 Hot';

    // "Rising" = still trending but older or lower velocity
    return '📈 Rising';
  }, [metrics.isTrending, metrics.likes, metrics.commentCount, metrics.views, metrics.createdAt]);
}
