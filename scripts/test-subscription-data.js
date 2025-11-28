// Test script to check subscription data in Supabase
import { createClient } from '@supabase/supabase-js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSubscriptionData() {
  console.log('Testing subscription data...');
  
  try {
    // Check if we can connect to Supabase
    const { data, error } = await supabase
      .from('subscription')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('Error querying subscription table:', error);
      return;
    }
    
    console.log('Subscription data found:', data.length, 'records');
    
    if (data.length > 0) {
      console.log('Sample subscription records:');
      data.forEach((sub, index) => {
        console.log(`${index + 1}. User ID: ${sub.userId}`);
        console.log(`   Subscription ID: ${sub.subscriptionId}`);
        console.log(`   Status: ${sub.status}`);
        console.log(`   Current Period End: ${sub.currentPeriodEnd}`);
        console.log(`   Customer ID: ${sub.customerId}`);
        console.log('---');
      });
    } else {
      console.log('No subscription records found in the database.');
      
      // Check if the table exists by trying to get table info
      const { data: tables, error: tableError } = await supabase
        .from('subscription')
        .select('userId,subscriptionId,status,currentPeriodEnd,customerId,createdAt,updatedAt')
        .limit(1);
      
      if (tableError) {
        console.error('Table may not exist or have different structure:', tableError);
      }
    }
    
    // Test specific user subscription
    console.log('\n--- Testing specific user subscription ---');
    // Replace with an actual user ID from your database
    const testUserId = 'test-user-id'; // Change this to a real user ID
    
    const { data: userData, error: userError } = await supabase
      .from('subscription')
      .select('*')
      .eq('userId', testUserId)
      .single();
    
    if (userError && userError.code !== 'PGRST116') {
      console.error('Error querying specific user:', userError);
    } else if (userData) {
      console.log('User subscription data:', userData);
    } else {
      console.log('No subscription found for user:', testUserId);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the test
testSubscriptionData().then(() => {
  console.log('Test completed.');
}).catch(err => {
  console.error('Test failed:', err);
});