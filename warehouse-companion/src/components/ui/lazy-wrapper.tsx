import React, { Suspense, ComponentType } from 'react';
import { Skeleton } from './skeleton';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Wrapper for lazy-loaded components with smart fallbacks
 */
export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback,
  className
}) => {
  const defaultFallback = (
    <div className={`animate-pulse ${className || ''}`}>
      <Skeleton className="h-full w-full min-h-[100px]" />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

/**
 * Higher-order component for lazy loading with error boundaries
 */
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(() =>
    import(/* @vite-ignore */ Component.toString())
      .then(module => ({ default: module.default || module }))
      .catch(() => {
        // Fallback component if lazy loading fails
        return {
          default: () => (
            <div className="text-center p-4 text-muted-foreground">
              Failed to load component
            </div>
          )
        };
      })
  );

  return (props: P) => (
    <LazyWrapper fallback={fallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );
}
