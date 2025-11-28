// Script to check subscription data and debug issues
import { createClient } from '@supabase/supabase-js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSubscriptionData() {
  console.log('🔍 Checking subscription data...\n');

  try {
    // Get all subscriptions
    const { data: subscriptions, error } = await supabase
      .from('subscription')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('❌ Error fetching subscriptions:', error);
      return;
    }

    console.log(`✅ Found ${subscriptions.length} subscription(s):\n`);

    subscriptions.forEach((sub, index) => {
      console.log(`--- Subscription #${index + 1} ---`);
      console.log(`ID: ${sub.id}`);
      console.log(`User ID: ${sub.userId}`);
      console.log(`Subscription ID: ${sub.subscriptionId}`);
      console.log(`Customer ID: ${sub.customerId}`);
      console.log(`Price ID: ${sub.priceId}`);
      console.log(`Status: ${sub.status}`);
      console.log(`Current Period End: ${sub.currentPeriodEnd}`);
      console.log(`Created At: ${sub.createdAt}`);
      console.log(`Updated At: ${sub.updatedAt}`);
      
      // Check if subscription is active
      const activeStatuses = ['active', 'trialing'];
      const isActive = activeStatuses.includes(sub.status) && 
                      sub.currentPeriodEnd &&
                      new Date(sub.currentPeriodEnd).getTime() > Date.now();
      
      console.log(`Is Active: ${isActive ? '✅ Yes' : '❌ No'}`);
      
      // Check time comparison
      if (sub.currentPeriodEnd) {
        const periodEnd = new Date(sub.currentPeriodEnd);
        const now = new Date();
        console.log(`Period End Date: ${periodEnd}`);
        console.log(`Current Date: ${now}`);
        console.log(`Period End > Now: ${periodEnd.getTime() > now.getTime()}`);
      }
      
      console.log('');
    });

    // Check for subscriptions with problematic statuses
    const problematicStatuses = ['past_due', 'unpaid', 'incomplete', 'incomplete_expired'];
    const problematicSubs = subscriptions.filter(sub => 
      problematicStatuses.includes(sub.status)
    );

    if (problematicSubs.length > 0) {
      console.log('⚠️  Subscriptions with problematic statuses:');
      problematicSubs.forEach(sub => {
        console.log(`  - User ${sub.userId}: ${sub.status}`);
      });
      console.log('');
    }

    // Check for expired subscriptions
    const expiredSubs = subscriptions.filter(sub => 
      sub.currentPeriodEnd && new Date(sub.currentPeriodEnd).getTime() <= Date.now() &&
      sub.status === 'active'
    );

    if (expiredSubs.length > 0) {
      console.log('⚠️  Expired subscriptions still marked as active:');
      expiredSubs.forEach(sub => {
        console.log(`  - User ${sub.userId}: Expired on ${sub.currentPeriodEnd}`);
      });
      console.log('');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Run the check
checkSubscriptionData().catch(console.error);