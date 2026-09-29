/**
 * Vercel Speed Insights Integration
 * This script injects Vercel Speed Insights tracking for performance monitoring.
 */

// Initialize Speed Insights queue
window.si = window.si || function () {
  (window.siq = window.siq || []).push(arguments);
};

// For production deployments on Vercel, the script will be automatically
// injected by Vercel when Speed Insights is enabled in the dashboard.
// This initialization ensures the queue is ready for tracking.

// If running locally or need to manually inject, you can uncomment below:
// import { injectSpeedInsights } from '@vercel/speed-insights';
// injectSpeedInsights();
