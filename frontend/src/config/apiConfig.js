// Centralized API base URL configuration
// Prefer VITE_API_URL (production/preview). Fallback to prod URL
export const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : 'https://psy-website-3.onrender.com/api';
