// Test script to verify authentication system
const API_BASE_URL = 'http://localhost:5000/api';

// Test user registration
async function testRegistration() {
  console.log('🧪 Testing user registration...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful:', data);
      return data;
    } else {
      console.log('❌ Registration failed:', data);
      return null;
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
    return null;
  }
}

// Test user login
async function testLogin(email, password) {
  console.log('🧪 Testing user login...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful:', data);
      return data;
    } else {
      console.log('❌ Login failed:', data);
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return null;
  }
}

// Test invalid login
async function testInvalidLogin() {
  console.log('🧪 Testing invalid login...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.log('✅ Invalid login correctly rejected:', data);
      return true;
    } else {
      console.log('❌ Invalid login was accepted:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Invalid login test error:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting authentication tests...\n');
  
  // Test 1: Registration
  const registrationResult = await testRegistration();
  
  // Test 2: Valid Login
  if (registrationResult) {
    await testLogin('test@example.com', 'password123');
  }
  
  // Test 3: Invalid Login
  await testInvalidLogin();
  
  console.log('\n🏁 Authentication tests completed!');
}

// Run the tests
runTests(); 