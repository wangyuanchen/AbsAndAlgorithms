require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');
const { HttpsProxyAgent } = require('https-proxy-agent');

const options = {
  ssl: 'require',
  connection: { agent: new HttpsProxyAgent(process.env.PROXY_URL) }
};

const sql = postgres(process.env.DATABASE_URL, options);

(async () => {
  const timeout = setTimeout(() => {
    console.error('❌ Timeout after 10 seconds');
    process.exit(1);
  }, 10000);
  
  try {
    console.log('🔄 Querying subscriptions...');
    const subscriptions = await sql`SELECT * FROM "subscription"`;
    console.log('✅ Query successful!');
    console.log('📋 Subscriptions in database:');
    console.table(subscriptions);
    
    // Show subscription details in a more readable format
    if (subscriptions.length > 0) {
      console.log('\n📊 Subscription Details:');
      subscriptions.forEach((sub, index) => {
        console.log(`\n--- Subscription ${index + 1} ---`);
        console.log(`ID: ${sub.id}`);
        console.log(`User ID: ${sub.userId}`);
        console.log(`Customer ID: ${sub.customerId}`);
        console.log(`Subscription ID: ${sub.subscriptionId}`);
        console.log(`Price ID: ${sub.priceId}`);
        console.log(`Status: ${sub.status}`);
        console.log(`Current Period End: ${sub.currentPeriodEnd || 'N/A'}`);
        console.log(`Created At: ${sub.createdAt}`);
        console.log(`Updated At: ${sub.updatedAt}`);
      });
    } else {
      console.log('\n⚠️  No subscriptions found in database');
    }
    
    clearTimeout(timeout);
    await sql.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    clearTimeout(timeout);
    try { await sql.end(); } catch {}
    process.exit(1);
  }
})();
