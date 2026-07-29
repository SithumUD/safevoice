// src/store/feedStore.ts
import { useEffect, useState } from 'react';
import { TopicCategory, TopicResponseDTO } from '../types/api';
import { topicsService } from '../services/topicsService';

export interface FeedState {
  activeCategory: string;
  sortOption: 'latest' | 'trending' | 'most_commented' | 'most_liked' | 'newest';
  topics: TopicResponseDTO[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isRefreshing: boolean;

  setCategory: (cat: string) => void;
  setSort: (sort: 'latest' | 'trending' | 'most_commented' | 'most_liked' | 'newest') => void;
  loadFeed: (page?: number, isRefresh?: boolean) => Promise<void>;
}

let state: FeedState = {
  activeCategory: 'All',
  sortOption: 'latest',
  topics: [],
  page: 0,
  hasMore: true,
  isLoading: false,
  isRefreshing: false,

  setCategory: (cat: string) => {
    state = { ...state, activeCategory: cat, page: 0, topics: [] };
    notifyListeners();
  },

  setSort: (sort) => {
    state = { ...state, sortOption: sort, page: 0, topics: [] };
    notifyListeners();
  },

  loadFeed: async (pageNumber = 0, isRefresh = false) => {
    if (isRefresh) {
      state = { ...state, isRefreshing: true };
    } else if (pageNumber === 0) {
      state = { ...state, isLoading: true };
    }
    notifyListeners();

    try {
      const res = await topicsService.getTopics({
        category: state.activeCategory,
        sort: state.sortOption,
        page: pageNumber,
        size: 15,
      });

      const newTopics =
        pageNumber === 0 ? res.content : [...state.topics, ...res.content];

      state = {
        ...state,
        topics: newTopics,
        page: pageNumber,
        hasMore: res.hasNext,
        isLoading: false,
        isRefreshing: false,
      };
    } catch {
      state = { ...state, isLoading: false, isRefreshing: false };
    }
    notifyListeners();
  },
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((l) => l());
}

export function useFeedStore(): FeedState {
  const [feedState, setFeedState] = useState<FeedState>({ ...state });

  useEffect(() => {
    const listener = () => setFeedState({ ...state });
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return feedState;
}

export const feedStore = state;
