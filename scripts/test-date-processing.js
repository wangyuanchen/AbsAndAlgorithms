// Test script to verify date processing logic
import { createClient } from '@supabase/supabase-js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Test various date values
const testDates = [
  null,
  undefined,
  0,
  1234567890, // Valid timestamp
  -1, // Invalid timestamp
  'invalid', // Invalid string
  9999999999999, // Very large timestamp
];

console.log('Testing date processing logic...\n');

testDates.forEach((timestamp, index) => {
  console.log(`Test ${index + 1}:`, timestamp);
  
  let currentPeriodEnd = null;
  if (timestamp) {
    try {
      currentPeriodEnd = new Date(timestamp * 1000).toISOString();
      console.log('  Result:', currentPeriodEnd);
    } catch (error) {
      console.log('  Error:', error.message);
      currentPeriodEnd = null;
    }
  } else {
    console.log('  Skipped (null/undefined)');
  }
  
  console.log('  Processed value:', currentPeriodEnd);
  console.log('');
});

// Test subscription data structure
console.log('\n--- Testing subscription data structure ---');

const testSubscriptionData = {
  id: 'sub_test123',
  customer: 'cus_test123',
  status: 'active',
  current_period_end: 1234567890,
  items: {
    data: [{
      price: {
        id: 'price_test123'
      }
    }]
  },
  metadata: {
    userId: 'user_test123'
  }
};

console.log('Test subscription object:', testSubscriptionData);

// Simulate the processing logic
let currentPeriodEnd = null;
if (testSubscriptionData.current_period_end) {
  try {
    currentPeriodEnd = new Date(testSubscriptionData.current_period_end * 1000).toISOString();
    console.log('Processed currentPeriodEnd:', currentPeriodEnd);
  } catch (error) {
    console.error('Error processing currentPeriodEnd:', error.message);
    currentPeriodEnd = null;
  }
}

const subscriptionData = {
  userId: testSubscriptionData.metadata?.userId,
  customerId: testSubscriptionData.customer,
  subscriptionId: testSubscriptionData.id,
  priceId: testSubscriptionData.items?.data?.[0]?.price?.id || '',
  currentPeriodEnd: currentPeriodEnd,
  status: testSubscriptionData.status,
  updatedAt: new Date().toISOString(),
};

console.log('Final subscription data:', subscriptionData);

// Test inserting into database (uncomment to use)
/*
console.log('\n--- Testing database insert ---');
(async () => {
  try {
    const { error } = await supabase
      .from('subscription')
      .insert({
        ...subscriptionData,
        createdAt: new Date().toISOString(),
      });
    
    if (error) {
      console.error('Database insert error:', error);
    } else {
      console.log('Successfully inserted test subscription');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
})();
*/