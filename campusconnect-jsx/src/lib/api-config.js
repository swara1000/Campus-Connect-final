// Backend API base URL.
// In production, set VITE_API_URL (e.g. https://campusconnect-api.onrender.com)
// in your hosting provider's environment variables.
// Falls back to localhost for local development.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";
