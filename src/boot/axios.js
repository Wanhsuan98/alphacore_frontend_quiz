import { boot } from 'quasar/wrappers';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://dev.tapgo.cc/test', 
});

// Store token variable
let authToken = null;

// Set token
export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => {
    return authToken;
  };

// Clear token
export const clearAuthToken = () => {
  authToken = null;
};

// Set interceptors and headers
api.interceptors.request.use(
    (config) => {
      if (authToken) {
        config.headers.Authorization = `${authToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };