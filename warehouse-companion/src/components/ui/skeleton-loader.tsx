/**
 * Ultra-Optimized Skeleton Loading Components
 * Provides smooth, performant loading states with customizable animations
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  animated?: boolean;
  speed?: 'slow' | 'normal' | 'fast';
  variant?: 'default' | 'pulse' | 'wave' | 'shimmer';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  animated = true,
  speed = 'normal',
  variant = 'shimmer',
  ...props
}) => {
  const speedClasses = {
    slow: 'animate-pulse',
    normal: 'animate-pulse',
    fast: '[animation-duration:0.5s]',
  };

  const variantClasses = {
    default: 'bg-muted',
    pulse: 'bg-muted animate-pulse',
    wave: 'bg-muted [animation:wave_1.5s_ease-in-out_infinite]',
    shimmer: 'bg-muted relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent [animation:shimmer_1.5s_ease-in-out_infinite]',
  };

  return (
    <div
      className={cn(
        'rounded-md',
        animated && speedClasses[speed],
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
};

// Table Skeleton Component
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
  animated?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
  animated = true,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={`header-${i}`}
              className="h-4 flex-1"
              animated={animated}
            />
          ))}
        </div>
      )}

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              className={cn(
                'h-4 flex-1',
                colIndex === 0 && 'w-20', // ID column narrower
                colIndex === columns - 1 && 'w-24' // Action column narrower
              )}
              animated={animated}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Card Skeleton Component
interface CardSkeletonProps {
  lines?: number;
  showAvatar?: boolean;
  showImage?: boolean;
  className?: string;
  animated?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  lines = 3,
  showAvatar = false,
  showImage = false,
  className,
  animated = true,
}) => {
  return (
    <div className={cn('space-y-3 p-4 border rounded-lg', className)}>
      {/* Image */}
      {showImage && (
        <Skeleton className="h-32 w-full rounded" animated={animated} />
      )}

      {/* Header with Avatar */}
      <div className="flex items-center space-x-3">
        {showAvatar && (
          <Skeleton className="h-10 w-10 rounded-full" animated={animated} />
        )}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" animated={animated} />
          <Skeleton className="h-3 w-1/2" animated={animated} />
        </div>
      </div>

      {/* Content Lines */}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={`line-${i}`}
            className={cn(
              'h-3',
              i === lines - 1 && 'w-2/3' // Last line shorter
            )}
            animated={animated}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-16" animated={animated} />
        <Skeleton className="h-8 w-20" animated={animated} />
      </div>
    </div>
  );
};

// List Skeleton Component
interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
  animated?: boolean;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  items = 5,
  showAvatar = false,
  className,
  animated = true,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={`item-${i}`} className="flex items-center space-x-3">
          {showAvatar && (
            <Skeleton className="h-8 w-8 rounded-full" animated={animated} />
          )}
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" animated={animated} />
            <Skeleton className="h-3 w-1/2" animated={animated} />
          </div>
          <Skeleton className="h-6 w-16" animated={animated} />
        </div>
      ))}
    </div>
  );
};

// Form Skeleton Component
interface FormSkeletonProps {
  fields?: number;
  showLabels?: boolean;
  className?: string;
  animated?: boolean;
}

export const FormSkeleton: React.FC<FormSkeletonProps> = ({
  fields = 4,
  showLabels = true,
  className,
  animated = true,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={`field-${i}`} className="space-y-2">
          {showLabels && (
            <Skeleton className="h-4 w-20" animated={animated} />
          )}
          <Skeleton
            className={cn(
              'h-10 w-full',
              i === fields - 1 && 'h-24' // Textarea field taller
            )}
            animated={animated}
          />
        </div>
      ))}
    </div>
  );
};

// Chart Skeleton Component
interface ChartSkeletonProps {
  bars?: number;
  className?: string;
  animated?: boolean;
}

export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({
  bars = 8,
  className,
  animated = true,
}) => {
  return (
    <div className={cn('flex items-end space-x-2 h-40', className)}>
      {Array.from({ length: bars }).map((_, i) => (
        <Skeleton
          key={`bar-${i}`}
          className={cn(
            'flex-1 rounded-t',
            animated && '[animation-delay:var(--delay)]'
          )}
          style={{
            '--delay': `${i * 0.1}s`,
            height: `${Math.random() * 60 + 20}%`, // Random height between 20-80%
          } as React.CSSProperties}
          animated={animated}
        />
      ))}
    </div>
  );
};

// Smart Skeleton that adapts to content type
interface SkeletonConfig {
  rows?: number;
  columns?: number;
  showAvatar?: boolean;
  showImage?: boolean;
  lines?: number;
  fields?: number;
  showLabels?: boolean;
  bars?: number;
}

interface SmartSkeletonProps {
  type: 'table' | 'card' | 'list' | 'form' | 'chart';
  config?: SkeletonConfig;
  className?: string;
  animated?: boolean;
}

export const SmartSkeleton: React.FC<SmartSkeletonProps> = ({
  type,
  config = {},
  className,
  animated = true,
}) => {
  const props = { ...config, className, animated };

  switch (type) {
    case 'table':
      return <TableSkeleton {...props} />;
    case 'card':
      return <CardSkeleton {...props} />;
    case 'list':
      return <ListSkeleton {...props} />;
    case 'form':
      return <FormSkeleton {...props} />;
    case 'chart':
      return <ChartSkeleton {...props} />;
    default:
      return <Skeleton {...props} />;
  }
};

// Loading Overlay Component
interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading...',
  children,
  className,
}) => {
  if (!isVisible) return <>{children}</>;

  return (
    <div className={cn('relative', className)}>
      {children}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
        <div className="text-center space-y-2">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Progressive Loading Component
interface ProgressiveLoadingProps {
  stages: Array<{
    stage: number;
    percentage: number;
    label: string;
  }>;
  currentStage: number;
  className?: string;
}

export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  stages,
  currentStage,
  className,
}) => {
  const currentStageData = stages.find(s => s.stage === currentStage);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm">
        <span>{currentStageData?.label || 'Loading...'}</span>
        <span>{currentStageData?.percentage.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${currentStageData?.percentage || 0}%` }}
        />
      </div>
    </div>
  );
};

export default Skeleton;
