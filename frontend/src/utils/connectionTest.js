import axios from 'axios';
import config from '../config/env';

/**
 * Test connection to backend server
 * Call this from your App.js or any screen to debug connection issues
 */
export const testBackendConnection = async () => {
  console.log('=== Backend Connection Test ===');
  console.log('Configuration:');
  console.log('  API Base URL:', config.apiBaseUrl);
  console.log('  Socket URL:', config.socketUrl);
  console.log('  Environment:', config.env);
  console.log('  App Name:', config.appName);
  console.log('  Enable Logging:', config.enableLogging);

  try {
    // Test health endpoint (without /api prefix)
    const healthUrl = config.apiBaseUrl.replace('/api', '/health');
    console.log('\nTesting health endpoint:', healthUrl);

    const response = await axios.get(healthUrl, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ SUCCESS! Backend is reachable');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ FAILED! Backend connection error');

    if (error.code === 'ECONNREFUSED') {
      console.error('Error: Connection refused');
      console.error('Solution: Backend is not running or IP is wrong');
      console.error('1. Check backend is running: cd backend && npm run dev');
      console.error('2. Verify IP address matches your computer');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Error: Connection timeout');
      console.error('Solution: Network/firewall issue');
      console.error('1. Check both devices on same WiFi');
      console.error('2. Check firewall allows port 5003');
    } else if (error.message?.includes('Network request failed')) {
      console.error('Error: Network request failed');
      console.error('Solution: Android network configuration issue');
      console.error('1. Check network_security_config.xml exists');
      console.error('2. Rebuild app: npm run android:dev');
    } else {
      console.error('Error:', error.message);
      console.error('Code:', error.code);
      console.error('Response:', error.response?.data);
    }

    return { success: false, error: error.message };
  }
};

/**
 * Test API endpoint
 */
export const testAPIEndpoint = async () => {
  console.log('\n=== Testing API Endpoint ===');
  try {
    const response = await axios.get(`${config.apiBaseUrl}/health`, {
      timeout: 10000,
    });
    console.log('✅ API endpoint reachable');
    return { success: true };
  } catch (error) {
    console.error('❌ API endpoint test failed:', error.message);
    // 404 is actually OK - means API routing works but endpoint doesn't exist
    if (error.response?.status === 404) {
      console.log('ℹ️ Got 404 - This is OK! API routing works.');
      return { success: true };
    }
    return { success: false, error: error.message };
  }
};

export default testBackendConnection;
