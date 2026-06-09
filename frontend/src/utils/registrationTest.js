import axios from 'axios';
import config from '../config/env';

/**
 * Test registration flow to debug issues
 * Call this from your RegisterScreen to test
 */
export const testRegistration = async (userData) => {
  console.log('=== Registration Test ===');
  console.log('Configuration:');
  console.log('  API Base URL:', config.apiBaseUrl);
  console.log('  User Data:', {
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    hasPassword: !!userData.password,
    phone: userData.phone || '(not provided)',
  });

  // Test 1: Check backend connectivity
  console.log('\n📡 Test 1: Backend Connectivity');
  try {
    const healthUrl = config.apiBaseUrl.replace('/api', '/health');
    const healthCheck = await axios.get(healthUrl, { timeout: 5000 });
    console.log('✅ Backend is reachable');
    console.log('   Status:', healthCheck.data.status);
  } catch (error) {
    console.error('❌ Backend not reachable!');
    console.error('   Error:', error.message);
    return { success: false, error: 'Backend not reachable: ' + error.message };
  }

  // Test 2: Test registration endpoint
  console.log('\n📝 Test 2: Registration Request');
  try {
    const response = await axios.post(
      `${config.apiBaseUrl}/auth/register`,
      userData,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Registration successful!');
    console.log('   User ID:', response.data.user?.id);
    console.log('   Email:', response.data.user?.email);
    console.log('   Has Token:', !!response.data.accessToken);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('❌ Registration failed!');
    console.error('   Status:', error.response?.status);
    console.error('   Error:', error.response?.data?.error || error.message);
    console.error('   Details:', error.response?.data?.details);

    // Provide specific guidance
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('\n🔧 Fix: Backend connection issue');
      console.error('   1. Check backend is running');
      console.error('   2. Verify IP address is correct');
      console.error('   3. Check firewall settings');
    } else if (error.response?.status === 409) {
      console.error('\n🔧 Fix: Email already exists');
      console.error('   Try a different email address');
    } else if (error.response?.status === 400) {
      console.error('\n🔧 Fix: Validation error');
      console.error('   Check password requirements');
      console.error('   - At least 8 characters');
      console.error('   - Contains uppercase letter');
      console.error('   - Contains lowercase letter');
      console.error('   - Contains number');
    }

    return {
      success: false,
      error: error.response?.data?.error || error.message,
      details: error.response?.data?.details,
    };
  }
};

/**
 * Test login with registered credentials
 */
export const testLogin = async (email, password) => {
  console.log('\n=== Login Test ===');
  console.log('Email:', email);

  try {
    const response = await axios.post(
      `${config.apiBaseUrl}/auth/login`,
      { email, password },
      {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    console.log('✅ Login successful!');
    console.log('   User:', response.data.user?.email);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Login failed!');
    console.error('   Error:', error.response?.data?.error || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

/**
 * Generate a unique test email
 */
export const generateTestEmail = () => {
  const timestamp = Date.now();
  return `test${timestamp}@example.com`;
};

/**
 * Complete registration test flow
 */
export const runFullRegistrationTest = async () => {
  console.log('🧪 Running Full Registration Test Flow');
  console.log('=====================================\n');

  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: generateTestEmail(),
    password: 'Test1234',
    phone: '',
  };

  console.log('Test User:', testUser.email);

  // Test registration
  const regResult = await testRegistration(testUser);

  if (regResult.success) {
    console.log('\n✅ Registration test PASSED');

    // Test login with same credentials
    console.log('\n🔐 Testing login with registered credentials...');
    const loginResult = await testLogin(testUser.email, testUser.password);

    if (loginResult.success) {
      console.log('\n✅ Login test PASSED');
      console.log('\n🎉 All tests PASSED! Registration is working correctly.');
      return { success: true, message: 'All tests passed!' };
    } else {
      console.log('\n⚠️ Login test FAILED');
      return {
        success: false,
        message: 'Registration worked but login failed: ' + loginResult.error,
      };
    }
  } else {
    console.log('\n❌ Registration test FAILED');
    return {
      success: false,
      message: 'Registration failed: ' + regResult.error,
      details: regResult.details,
    };
  }
};

export default testRegistration;
