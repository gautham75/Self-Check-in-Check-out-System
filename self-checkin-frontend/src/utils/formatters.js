/**
 * Date and string formatting utilities
 */

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined) return 'N/A';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
};

export const resolveApiUrl = (url) => {
  if (!url) return '';
  const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  let apiBase = rawBase.trim();
  if (apiBase.endsWith('/')) apiBase = apiBase.slice(0, -1);
  if (!apiBase.endsWith('/api')) apiBase += '/api';

  if (url.startsWith('http://localhost:8080/api')) {
    return url.replace('http://localhost:8080/api', apiBase);
  }
  return url;
};

