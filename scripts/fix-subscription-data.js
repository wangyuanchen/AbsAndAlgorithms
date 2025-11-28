// Script to manually fix subscription data issues
import { createClient } from '@supabase/supabase-js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkAndFixSubscriptionData() {
  console.log('Checking subscription data...');
  
  try {
    // Check if we can connect to Supabase
    const { data, error } = await supabase
      .from('subscription')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error querying subscription table:', error);
      return;
    }
    
    console.log('Found subscription records:', data.length);
    
    if (data.length > 0) {
      console.log('Sample records:');
      data.forEach((sub, index) => {
        console.log(`${index + 1}. User: ${sub.userId}`);
        console.log(`   Status: ${sub.status}`);
        console.log(`   Subscription ID: ${sub.subscriptionId}`);
        console.log(`   Customer ID: ${sub.customerId}`);
        console.log('---');
      });
    } else {
      console.log('No subscription records found.');
      
      // Let's check if we can query users to see if there are any users
      const { data: users, error: userError } = await supabase
        .from('user')
        .select('id,email')
        .limit(5);
      
      if (userError) {
        console.error('Error querying users:', userError);
        return;
      }
      
      console.log('Sample users:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}, Email: ${user.email}`);
      });
    }
    
    // Test creating a sample subscription record (uncomment to use)
    /*
    console.log('\n--- Creating test subscription record ---');
    const testUserId = 'test-user-id'; // Replace with actual user ID
    const testSubscription = {
      id: 'sub_' + Date.now(),
      userId: testUserId,
      subscriptionId: 'sub_test123',
      customerId: 'cus_test123',
      priceId: 'price_test123',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('subscription')
      .insert(testSubscription);
    
    if (insertError) {
      console.error('Error inserting test subscription:', insertError);
    } else {
      console.log('Test subscription created successfully');
    }
    */
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Function to manually create a subscription record for a user
async function createSubscriptionForUser(userId, subscriptionData) {
  try {
    console.log(`Creating subscription for user: ${userId}`);
    
    const subscription = {
      id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      userId: userId,
      subscriptionId: subscriptionData.subscriptionId || 'sub_manual_' + Date.now(),
      customerId: subscriptionData.customerId || 'cus_manual_' + Date.now(),
      priceId: subscriptionData.priceId || 'price_HK49_MONTHLY',
      status: subscriptionData.status || 'active',
      currentPeriodEnd: subscriptionData.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('subscription')
      .insert(subscription);
    
    if (error) {
      console.error('Error creating subscription:', error);
      return false;
    }
    
    console.log('Subscription created successfully:', subscription);
    return true;
  } catch (err) {
    console.error('Error creating subscription:', err);
    return false;
  }
}

// Run the check
checkAndFixSubscriptionData().then(() => {
  console.log('Check completed.');
}).catch(err => {
  console.error('Check failed:', err);
});

// Export functions for manual use
export { checkAndFixSubscriptionData, createSubscriptionForUser };