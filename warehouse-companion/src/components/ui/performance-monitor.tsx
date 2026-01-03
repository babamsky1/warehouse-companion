/**
 * Performance Monitor Component
 * Add to your app to measure page load performance
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  apiRequests: number;
  bundleSize: number;
}

export const PerformanceMonitor: React.FC<{ show: boolean }> = ({ show }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    domContentLoaded: 0,
    firstPaint: 0,
    firstContentfulPaint: 0,
    apiRequests: 0,
    bundleSize: 0,
  });

  useEffect(() => {
    if (!show) return;

    // Measure page load performance
    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');

      setMetrics({
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        apiRequests: performance.getEntriesByType('resource').filter(
          entry => entry.initiatorType === 'xmlhttprequest' || entry.initiatorType === 'fetch'
        ).length,
        bundleSize: (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0,
      });
    };

    // Measure when page loads
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    return () => window.removeEventListener('load', measurePerformance);
  }, [show]);

  if (!show) return null;

  const getPerformanceColor = (time: number) => {
    if (time < 1000) return 'bg-green-500';
    if (time < 3000) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          📊 Performance Monitor
          <Badge variant="outline" className="text-xs">
            {metrics.loadTime > 0 ? `${metrics.loadTime.toFixed(0)}ms` : 'Loading...'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-muted-foreground">Load Time:</span>
            <div className={`inline-block ml-1 px-1 rounded text-white ${getPerformanceColor(metrics.loadTime)}`}>
              {metrics.loadTime.toFixed(0)}ms
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">DOM Ready:</span>
            <div className={`inline-block ml-1 px-1 rounded text-white ${getPerformanceColor(metrics.domContentLoaded)}`}>
              {metrics.domContentLoaded.toFixed(0)}ms
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">First Paint:</span>
            <div className={`inline-block ml-1 px-1 rounded text-white ${getPerformanceColor(metrics.firstPaint)}`}>
              {metrics.firstPaint.toFixed(0)}ms
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">API Requests:</span>
            <span className="ml-1 font-mono">{metrics.apiRequests}</span>
          </div>
        </div>

        <div className="pt-2 border-t text-xs text-muted-foreground">
          💡 <strong>Optimization Applied:</strong> Removed aggressive prefetching
        </div>
      </CardContent>
    </Card>
  );
};

// Quick performance logger for development
export const logPerformance = () => {
  if (typeof window !== 'undefined') {
    console.group('🚀 Performance Metrics');

    // Navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    console.log('Page Load Time:', `${(navigation.loadEventEnd - navigation.fetchStart).toFixed(0)}ms`);
    console.log('DOM Content Loaded:', `${(navigation.domContentLoadedEventEnd - navigation.fetchStart).toFixed(0)}ms`);

    // Resource timing
    const resources = performance.getEntriesByType('resource');
    const apiRequests = resources.filter(r =>
      r.initiatorType === 'xmlhttprequest' || r.initiatorType === 'fetch'
    );
    console.log('API Requests:', apiRequests.length);

    // Memory usage
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      console.log('Memory Used:', `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
    }

    console.groupEnd();
  }
};
