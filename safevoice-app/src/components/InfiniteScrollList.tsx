// src/components/InfiniteScrollList.tsx
import { FlashList, FlashListProps } from '@shopify/flash-list';
import React, { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { theme } from '../theme';
import PullToRefresh from './PullToRefresh';

interface InfiniteScrollListProps<T> extends Omit<FlashListProps<T>, 'onEndReached' | 'refreshControl'> {
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  estimatedItemSize?: number;
}

function InfiniteScrollListInner<T>(
  {
    onLoadMore,
    isLoadingMore = false,
    hasMore = false,
    onRefresh,
    isRefreshing = false,
    estimatedItemSize = 160,
    ...flashListProps
  }: InfiniteScrollListProps<T>,
  _ref: React.ForwardedRef<FlashList<T>>
) {
  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  const ListFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.brandPrimary} />
      </View>
    );
  }, [isLoadingMore]);

  return (
    <FlashList
      {...flashListProps}
      estimatedItemSize={estimatedItemSize}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.3}
      ListFooterComponent={ListFooter}
      refreshControl={
        onRefresh ? (
          <PullToRefresh refreshing={isRefreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    />
  );
}

const InfiniteScrollList = React.forwardRef(InfiniteScrollListInner) as <T>(
  props: InfiniteScrollListProps<T> & { ref?: React.ForwardedRef<FlashList<T>> }
) => ReturnType<typeof InfiniteScrollListInner>;

export default InfiniteScrollList;

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
