/**
 * Central API Export Point
 * Segments have been moved to domain-specific files for better maintainability.
 */

export * from './analytics.api';
export * from './inventory.api';
export * from './master.api';
export * from './operations.api';
export { default as apiClient } from './axios';

