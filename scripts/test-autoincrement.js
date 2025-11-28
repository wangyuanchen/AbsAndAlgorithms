// Test script to verify auto-increment ID functionality
import { createClient } from '@supabase/supabase-js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAutoIncrement() {
  console.log('Testing auto-increment ID functionality...\n');

  // Test inserting a menu record
  console.log('1. Testing menu table auto-increment...');
  const { data: menuData, error: menuError } = await supabase
    .from('menu')
    .insert({
      userId: 'test-user-id',
      name: 'Test Menu',
      ingredients: '[]',
      protein: 100,
      carbs: 200,
      fat: 50,
      calories: 1500,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select();

  if (menuError) {
    console.error('Menu insert error:', menuError);
    return;
  }

  console.log('Menu inserted successfully:', menuData[0]);
  console.log('Menu ID (should be integer):', typeof menuData[0].id, menuData[0].id);

  // Test inserting a recipe record
  console.log('\n2. Testing recipe table auto-increment...');
  const { data: recipeData, error: recipeError } = await supabase
    .from('recipe')
    .insert({
      menuId: menuData[0].id.toString(), // Convert to string for foreign key
      name: 'Test Recipe',
      instructions: '[]',
      ingredients: '[]',
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select();

  if (recipeError) {
    console.error('Recipe insert error:', recipeError);
    return;
  }

  console.log('Recipe inserted successfully:', recipeData[0]);
  console.log('Recipe ID (should be integer):', typeof recipeData[0].id, recipeData[0].id);

  // Test inserting a subscription record
  console.log('\n3. Testing subscription table auto-increment...');
  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from('subscription')
    .insert({
      userId: 'test-user-id',
      subscriptionId: 'test-subscription-id',
      customerId: 'test-customer-id',
      priceId: 'test-price-id',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select();

  if (subscriptionError) {
    console.error('Subscription insert error:', subscriptionError);
    return;
  }

  console.log('Subscription inserted successfully:', subscriptionData[0]);
  console.log('Subscription ID (should be integer):', typeof subscriptionData[0].id, subscriptionData[0].id);

  // Test retrieving the records
  console.log('\n4. Retrieving inserted records...');
  
  const { data: retrievedMenus, error: menuRetrieveError } = await supabase
    .from('menu')
    .select('*')
    .eq('name', 'Test Menu');

  if (menuRetrieveError) {
    console.error('Menu retrieve error:', menuRetrieveError);
  } else {
    console.log('Retrieved menu:', retrievedMenus[0]);
  }

  const { data: retrievedRecipes, error: recipeRetrieveError } = await supabase
    .from('recipe')
    .select('*')
    .eq('name', 'Test Recipe');

  if (recipeRetrieveError) {
    console.error('Recipe retrieve error:', recipeRetrieveError);
  } else {
    console.log('Retrieved recipe:', retrievedRecipes[0]);
  }

  const { data: retrievedSubscriptions, error: subscriptionRetrieveError } = await supabase
    .from('subscription')
    .select('*')
    .eq('subscriptionId', 'test-subscription-id');

  if (subscriptionRetrieveError) {
    console.error('Subscription retrieve error:', subscriptionRetrieveError);
  } else {
    console.log('Retrieved subscription:', retrievedSubscriptions[0]);
  }

  console.log('\n✅ Auto-increment ID testing completed!');
}

// Run the test
testAutoIncrement().catch(console.error);