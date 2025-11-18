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
    console.log('🔄 Querying users...');
    const users = await sql`SELECT * FROM "user"`;
    console.log('✅ Query successful!');
    console.log('📋 Users in database:');
    console.table(users);
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
