import * as React from "react";

/**
 * Calculates the remaining time between now and a future date
 * @param {string} expiresAt - ISO date string of expiration time
 * @returns {string} Formatted time remaining or "Expired"
 */
export function calculateTimeRemaining(expiresAt: string): string {
  const now = new Date();
  const expiryTime = new Date(expiresAt);
  const diffMs = expiryTime.getTime() - now.getTime();

  // If already expired
  if (diffMs <= 0) {
    return "Expired";
  }

  // Calculate time components
  const diffMins = Math.floor(diffMs / 60000);
  const mins = diffMins % 60;
  const hours = Math.floor(diffMins / 60);

  return `${hours}h ${mins}m remaining`;
}

/**
 * Determines if a request is expired
 * @param {string} expiresAt - ISO date string of expiration time
 * @returns {boolean} True if expired, false otherwise
 */
export function isExpired(expiresAt: string): boolean {
  const now = new Date();
  const expiryTime = new Date(expiresAt);
  return now > expiryTime;
}

/**
 * Returns the percentage of time elapsed (useful for progress bars)
 * @param {string} createdAt - ISO date string of creation time
 * @param {string} expiresAt - ISO date string of expiration time
 * @returns {number} Percentage of time elapsed (0-100)
 */
export function getTimeElapsedPercentage(
  createdAt: string,
  expiresAt: string
): number {
  const now = new Date().getTime();
  const createTime = new Date(createdAt).getTime();
  const expiryTime = new Date(expiresAt).getTime();

  const totalDuration = expiryTime - createTime;
  const elapsedDuration = now - createTime;

  if (elapsedDuration >= totalDuration) {
    return 100;
  }

  return Math.round((elapsedDuration / totalDuration) * 100);
}

/**
 * Returns time remaining in various units
 * @param {string} expiresAt - ISO date string of expiration time
 * @returns {Object} Object containing days, hours, minutes, seconds remaining
 */
export function getDetailedTimeRemaining(expiresAt: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
} {
  const now = new Date();
  const expiryTime = new Date(expiresAt);
  const diffMs = expiryTime.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isExpired: true,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isExpired: false,
  };
}

/**
 * Returns a user-friendly relative time string
 * @param {string} timestamp - ISO date string to compare to now
 * @returns {string} Relative time (e.g. "2 minutes ago", "in 3 hours")
 */
export function getRelativeTimeString(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = date.getTime() - now.getTime();
  const isFuture = diffMs > 0;
  const absDiffMs = Math.abs(diffMs);

  // Convert to seconds
  const diffSecs = Math.floor(absDiffMs / 1000);

  if (diffSecs < 60) {
    return isFuture ? `in ${diffSecs} seconds` : `${diffSecs} seconds ago`;
  }

  // Convert to minutes
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) {
    return isFuture ? `in ${diffMins} minutes` : `${diffMins} minutes ago`;
  }

  // Convert to hours
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return isFuture ? `in ${diffHours} hours` : `${diffHours} hours ago`;
  }

  // Convert to days
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return isFuture ? `in ${diffDays} days` : `${diffDays} days ago`;
  }

  // Convert to months
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return isFuture ? `in ${diffMonths} months` : `${diffMonths} months ago`;
  }

  // Convert to years
  const diffYears = Math.floor(diffMonths / 12);
  return isFuture ? `in ${diffYears} years` : `${diffYears} years ago`;
}

/**
 * React hook to track time remaining with automatic updates
 * @param {string} expiresAt - ISO date string of expiration time
 * @param {number} updateIntervalMs - How often to update the timer (ms)
 * @returns {Object} Object with time remaining info and status
 */
export function useCountdown(expiresAt: string, updateIntervalMs = 1000) {
  const [timeInfo, setTimeInfo] = React.useState(() =>
    getDetailedTimeRemaining(expiresAt)
  );

  React.useEffect(() => {
    // Update immediately and then at regular intervals
    setTimeInfo(getDetailedTimeRemaining(expiresAt));

    const interval = setInterval(() => {
      const newTimeInfo = getDetailedTimeRemaining(expiresAt);
      setTimeInfo(newTimeInfo);

      // Clear interval when expired
      if (newTimeInfo.isExpired) {
        clearInterval(interval);
      }
    }, updateIntervalMs);

    // Clean up on unmount
    return () => clearInterval(interval);
  }, [expiresAt, updateIntervalMs]);

  return timeInfo;
}

/**
 * Format remaining time in a nice, human-readable format
 * @param {Object} timeInfo - Time information object from getDetailedTimeRemaining
 * @returns {string} Formatted time string
 */
export function formatRemainingTime(timeInfo: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}) {
  if (timeInfo.isExpired) {
    return "Expired";
  }

  if (timeInfo.days > 0) {
    return `${timeInfo.days}d ${timeInfo.hours}h remaining`;
  }

  if (timeInfo.hours > 0) {
    return `${timeInfo.hours}h ${timeInfo.minutes}m remaining`;
  }

  if (timeInfo.minutes > 0) {
    return `${timeInfo.minutes}m ${timeInfo.seconds}s remaining`;
  }

  return `${timeInfo.seconds}s remaining`;
}
