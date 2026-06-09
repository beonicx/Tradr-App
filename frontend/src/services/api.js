import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/env';

const BASE_URL = config.apiBaseUrl;

console.log('🔧 API Service Initialized');
console.log('   Base URL:', BASE_URL);
console.log('   Config:', config);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (reqConfig) => {
    console.log('📤 API Request:', reqConfig.method?.toUpperCase(), reqConfig.url);
    console.log('   Full URL:', reqConfig.baseURL + reqConfig.url);
    console.log('   Data:', JSON.stringify(reqConfig.data, null, 2));

    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
      console.log('   Token: Added');
    }
    return reqConfig;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url);
    console.log('   Status:', response.status);
    console.log('   Data:', JSON.stringify(response.data, null, 2).substring(0, 200));
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', error.config?.method?.toUpperCase(), error.config?.url);
    console.error('   Status:', error.response?.status);
    console.error('   Message:', error.message);
    console.error('   Response:', JSON.stringify(error.response?.data, null, 2));

    const original = error.config;
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !original._retry
    ) {
      original._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const res = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken, refreshToken: newRT } = res.data;
        await AsyncStorage.multiSet([
          ['accessToken', accessToken],
          ['refreshToken', newRT],
        ]);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      }
    }
    return Promise.reject(error);
  }
);

export default api;