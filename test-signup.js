// Test script to verify signup improvements
import axios from 'axios';

async function testSignup() {
  console.log('Testing signup endpoint...');
  
  try {
    // Test backend health
    console.log('1. Checking backend health...');
    const healthResponse = await axios.get('http://localhost:5000');
    console.log('✅ Backend is running');
    console.log('Backend info:', healthResponse.data);
    
    // Test signup
    console.log('\n2. Testing signup request...');
    const signupResponse = await axios.post('http://localhost:5000/auth/signup', {
      name: 'Test User',  // Using 'name' instead of 'fullName'
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Signup successful:', signupResponse.data);
    
  } catch (error) {
    console.log('❌ Error occurred:');
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Error: ${error.response.data}`);
    } else if (error.request) {
      console.log('No response received - backend might be down');
    } else {
      console.log(`Request error: ${error.message}`);
    }
    
    // Show the actual error response
    if (error.response && error.response.data) {
      console.log('Full error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testSignup();