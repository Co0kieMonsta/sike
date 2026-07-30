import axios from "axios";

// Use relative path in browser to avoid CORS
// Use full URL on server
let baseURL = '/api';

if (typeof window === 'undefined') {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    baseURL = process.env.NEXT_PUBLIC_SITE_URL + '/api';
  } else if (process.env.VERCEL_URL) {
    baseURL = `https://${process.env.VERCEL_URL}/api`;
  } else {
    baseURL = 'http://localhost:3000/api';
  }
}

export const api = axios.create({
  baseURL,
});
