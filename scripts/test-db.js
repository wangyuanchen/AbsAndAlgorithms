require('dotenv').config({ path: '.env.local' });

const postgres = require('postgres');

async function testConnection() {
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  const proxyUrl = process.env.PROXY_URL || 'http://127.0.0.1:7897';

  const clientOptions = {
    ssl: 'require',
    max: 1,
    idle_timeout: 0,
    max_lifetime: 0,
    connect_timeout: 10,
    prepare: false,
  };

  if (isDevelopment && process.env.USE_PROXY === 'true') {
    try {
      const url = new URL(proxyUrl);
      let agent;
      
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        const { HttpsProxyAgent } = require('https-proxy-agent');
        agent = new HttpsProxyAgent(proxyUrl);
      } else if (url.protocol.startsWith('socks')) {
        const { SocksProxyAgent } = require('socks-proxy-agent');
        agent = new SocksProxyAgent(proxyUrl);
      }
      
      if (agent) {
        clientOptions.connection = { agent };
      }
      console.log('✅ Using proxy:', proxyUrl);
    } catch (error) {
      console.warn('⚠️  Failed to setup proxy:', error.message);
    }
  }

  try {
    console.log('🔄 Connecting to database...');
    const sql = postgres(process.env.DATABASE_URL, clientOptions);
    
    const result = await sql`SELECT current_database(), current_user, version()`;
    console.log('✅ Database connection successful!');
    console.log('Database:', result[0].current_database);
    console.log('User:', result[0].current_user);
    console.log('Version:', result[0].version.split(' ')[0], result[0].version.split(' ')[1]);
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
