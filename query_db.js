const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mftkzuwdpwwhkyvuhavu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdGt6dXdkcHd3aGt5dnVoYXZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTc1MTksImV4cCI6MjA4OTY5MzUxOX0.5g76R3Yc4z4hcgwqIEsSZwKCOc7vipkcrCCEv5xSFxo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthInsert() {
  console.log('--- TEST AUTH INSERT SCRIPT ---');

  const randomString = Math.random().toString(36).substring(7);
  const email = `testuser_${randomString}@example.com`;
  const password = 'password123';

  console.log(`1. Signing up dummy user: ${email}`);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error('Sign up failed:', authError.message);
    return;
  }

  console.log('User signed up successfully. UID:', authData.user.id);
  const uid = authData.user.id;

  console.log('\n2. Upserting profile...');
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: uid,
    name: 'Test Setup User',
    number: '1234567890',
    location: 'Test Location'
  });

  if (profileError) {
    console.error('Profile upsert failed:', profileError.message);
  } else {
    console.log('Profile upsert succeeded.');
  }

  console.log('\n3. Inserting product...');
  const { data: pData, error: pError } = await supabase.from('products').insert([{
    seller_id: uid,
    seller_name: 'Test Setup User',
    title: 'Test Product',
    price: '₹100',
    condition: 'Good',
    image_url: 'test-image.jpg',
    status: 'In Stock'
  }]).select(); // Use .select() to get the inserted row back!

  if (pError) {
    console.error('Product insert failed:', pError.message);
  } else {
    console.log('Product insert succeeded! Returned row:', pData);
  }

  console.log('\n4. Fetching all products as this user...');
  const { data: fetchProducts, error: fetchError } = await supabase.from('products').select('*');
  if (fetchError) {
    console.error('Fetch error:', fetchError.message);
  } else {
    console.log(`Fetch succeeded. Total products visible: ${fetchProducts.length}`);
    console.log(fetchProducts);
  }

  // Cleanup: Delete the product so we don't pollute the DB
  if (pData && pData.length > 0) {
    console.log('\n5. Cleaning up product...');
    await supabase.from('products').delete().eq('id', pData[0].id);
    console.log('Cleanup done.');
  }
}

testAuthInsert();
