import axios from "axios";

// Use relative path in browser to avoid CORS (requests go to origin)
// Use full URL on server where relative paths don't exist
const baseURL = typeof window !== 'undefined' 
  ? '/api' 
  : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/api';

export const api = axios.create({
  baseURL,
});
