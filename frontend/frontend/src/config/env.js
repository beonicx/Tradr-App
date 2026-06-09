import {
  API_BASE_URL,
  SOCKET_URL,
  APP_ENV,
  APP_NAME,
  ENABLE_LOGGING,
  ENABLE_ANALYTICS,
} from '@env';

const config = {
  apiBaseUrl: API_BASE_URL || 'http://127.0.0.1:5003/api',
  socketUrl: SOCKET_URL || 'http://127.0.0.1:5003',
  env: APP_ENV || 'development',
  appName: APP_NAME || 'TradingApp',
  enableLogging: ENABLE_LOGGING === 'true',
  enableAnalytics: ENABLE_ANALYTICS === 'true',
};

export const isDevelopment = config.env === 'development';
export const isStaging = config.env === 'staging';
export const isProduction = config.env === 'production';

export default config;
