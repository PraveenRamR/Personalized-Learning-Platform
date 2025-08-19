import { api } from './apiClient';

export async function fetchRecommendations(token: string) {
  const res = await api.get("/recommendations/personalized/", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function triggerRecommendationRefresh(token: string) {
  const res = await api.post("/recommendations/trigger_refresh/", {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Polling function to replace WebSockets
export async function pollForRecommendationUpdates(token: string, callback: () => void) {
  // Instead of checking status, just invalidate the query to refresh recommendations
  callback();
}

// This endpoint doesn't exist, but we're keeping the function for compatibility
export async function getRecommendationStatus(token: string) {
  // Just return empty object instead of making an API call to a non-existent endpoint
  return {};
}
