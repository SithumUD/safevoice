// src/components/PullToRefresh.tsx
import React from 'react';
import { RefreshControl, RefreshControlProps } from 'react-native';
import { theme } from '../theme';

interface PullToRefreshProps extends Omit<RefreshControlProps, 'refreshing' | 'onRefresh'> {
  refreshing: boolean;
  onRefresh: () => void;
}

export default function PullToRefresh({ refreshing, onRefresh, ...rest }: PullToRefreshProps) {
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={theme.brandPrimary}
      colors={[theme.brandPrimary, theme.structure]}
      progressBackgroundColor={theme.backgroundPrimary}
      {...rest}
    />
  );
}
