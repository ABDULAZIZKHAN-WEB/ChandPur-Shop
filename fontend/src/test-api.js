import api from './services/api.js';
import * as authService from './services/authService.js';

// Test the API connection and Sanctum authentication
async function testApi() {
  try {
    console.log('🔧 Testing Sanctum Authentication...');
    console.log('📍 API Base URL:', api.defaults.baseURL);
    console.log('📍 Frontend URL:', window.location.origin);
    
    // Step 1: Test CSRF cookie fetch
    console.log('\n📋 Step 1: Fetching CSRF cookie...');
    try {
      await api.get('/sanctum/csrf-cookie');
      console.log('✅ CSRF cookie fetched successfully');
      
      // Show cookies
      const cookies = document.cookie.split(';').map(c => c.trim()).filter(c => c);
      console.log('🍪 Current cookies:', cookies.length > 0 ? cookies : 'No cookies found');
    } catch (error) {
      console.error('❌ CSRF cookie fetch failed:', error);
      return;
    }
    
    // Step 2: Test user endpoint without authentication (should return 401)
    console.log('\n📋 Step 2: Testing /api/user endpoint (should return 401)...');
    try {
      const userResponse = await api.get('/api/user');
      console.log('⚠️ Unexpected success - user should not be authenticated:', userResponse.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Expected 401 - user not authenticated (this is correct)');
      } else {
        console.error('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    
    // Step 3: Test actual login
    console.log('\n📋 Step 3: Attempting login with test credentials...');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: password');
    
    try {
      const loginResponse = await authService.login({
        email: 'test@example.com',
        password: 'password'
      });
      
      console.log('✅ Login successful!');
      console.log('👤 User data:', loginResponse.data.user);
      console.log('💬 Message:', loginResponse.data.message);
      
      // Step 4: Test authenticated user endpoint
      console.log('\n📋 Step 4: Testing authenticated /api/user endpoint...');
      const userResponse = await authService.getUser();
      console.log('✅ Authenticated user data retrieved:', userResponse.data);
      
      console.log('\n🎉 Authentication test PASSED! Login is working correctly.');
      
    } catch (error) {
      console.error('\n❌ Login failed!');
      console.log('📊 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message,
        errors: error.response?.data?.errors,
        fullResponse: error.response?.data
      });
      
      if (error.response?.status === 422) {
        console.log('💡 422 Error usually means validation failed or CSRF token issue');
      } else if (error.response?.status === 401) {
        console.log('💡 401 Error means credentials are incorrect');
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed with unexpected error:', error);
  }
}

// Run the test
testApi();