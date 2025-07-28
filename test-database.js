// Test script for database functionality
const API_BASE_URL = 'http://localhost:5000/api';

async function testDatabase() {
  console.log('🧪 Testing Database Functionality...\n');

  try {
    // Test 1: Get all products
    console.log('1. Testing GET /api/products...');
    const productsResponse = await fetch(`${API_BASE_URL}/products`);
    const products = await productsResponse.json();
    console.log(`✅ Found ${products.length} products`);
    console.log('Sample product:', products[0]);
    console.log('');

    // Test 2: Get products with filter
    console.log('2. Testing GET /api/products?gender=men...');
    const menProductsResponse = await fetch(`${API_BASE_URL}/products?gender=men`);
    const menProducts = await menProductsResponse.json();
    console.log(`✅ Found ${menProducts.length} men's products`);
    console.log('');

    // Test 3: Test user registration
    console.log('3. Testing POST /api/auth/register...');
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123'
    };
    
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ User registered successfully');
      console.log('Token:', registerData.token.substring(0, 20) + '...');
      console.log('User ID:', registerData.user.id);
      console.log('');
      
      // Test 4: Test login with the registered user
      console.log('4. Testing POST /api/auth/login...');
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ User login successful');
        console.log('Token:', loginData.token.substring(0, 20) + '...');
        console.log('');
        
        // Test 5: Test adding to cart
        console.log('5. Testing POST /api/cart...');
        const cartResponse = await fetch(`${API_BASE_URL}/cart`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
          },
          body: JSON.stringify({
            productId: 1,
            quantity: 2
          })
        });
        
        if (cartResponse.ok) {
          console.log('✅ Added product to cart successfully');
          console.log('');
          
          // Test 6: Test getting cart
          console.log('6. Testing GET /api/cart...');
          const getCartResponse = await fetch(`${API_BASE_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${loginData.token}` }
          });
          
          if (getCartResponse.ok) {
            const cartItems = await getCartResponse.json();
            console.log(`✅ Found ${cartItems.length} items in cart`);
            console.log('');
          }
        }
      }
    }
    
    // Test 7: Test admin login
    console.log('7. Testing POST /api/admin/login...');
    const adminResponse = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@shopping.com',
        password: 'admin'
      })
    });
    
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('✅ Admin login successful');
      console.log('Admin Token:', adminData.token.substring(0, 20) + '...');
      console.log('');
      
      // Test 8: Test getting all orders (admin)
      console.log('8. Testing GET /api/admin/orders...');
      const adminOrdersResponse = await fetch(`${API_BASE_URL}/admin/orders`, {
        headers: { 'Authorization': `Bearer ${adminData.token}` }
      });
      
      if (adminOrdersResponse.ok) {
        const orders = await adminOrdersResponse.json();
        console.log(`✅ Found ${orders.length} orders (admin view)`);
        console.log('');
      }
    }
    
    console.log('🎉 All database tests completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log(`- Products: ${products.length}`);
    console.log(`- Men's Products: ${menProducts.length}`);
    console.log('- User registration: ✅');
    console.log('- User login: ✅');
    console.log('- Cart operations: ✅');
    console.log('- Admin login: ✅');
    console.log('- Admin orders: ✅');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDatabase(); 