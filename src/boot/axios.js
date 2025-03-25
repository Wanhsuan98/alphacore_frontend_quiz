import { boot } from 'quasar/wrappers';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://dev.tapgo.cc/test', 
});

// 儲存 token 的記憶體變數
let authToken = null;

// 設置 token 的方法
export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => {
    return authToken;
  };

// 清除 token 的方法
export const clearAuthToken = () => {
  authToken = null;
};

// set interceptors and headers
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