import axios from 'axios';


let base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
if (base.endsWith('/api')) {
  console.warn('VITE_API_URL ends with /api; removing suffix to avoid 404s');
  base = base.replace(/\/api$/, '');
}
console.log('API baseURL =', base);

const defaultTimeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '120000', 10);
const api = axios.create({
  baseURL: base,
  timeout: defaultTimeout, 
});

if (!import.meta.env.VITE_API_TIMEOUT) {
  console.info('Using default API timeout of', defaultTimeout, 'ms');
} else {
  console.info('Using VITE_API_TIMEOUT =', defaultTimeout, 'ms');
}


api.interceptors.request.use((cfg) => {
  console.log('API request', cfg.method.toUpperCase(), cfg.baseURL + cfg.url);
  return cfg;
});
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.message === 'Network Error') {
      console.error(
        `Network Error when contacting backend (${base}). ` +
          'Is the server running and accessible?'
      );
    }
    return Promise.reject(err);
  }
);

export default api;