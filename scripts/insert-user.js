require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function insertUser() {
  const proxyUrl = process.env.PROXY_URL || 'http://127.0.0.1:7897';

  const clientOptions = {
    ssl: 'require',
    max: 1,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    connect_timeout: 10,
    prepare: false,
  };

  if (process.env.USE_PROXY === 'true') {
    const { HttpsProxyAgent } = require('https-proxy-agent');
    const agent = new HttpsProxyAgent(proxyUrl);
    clientOptions.connection = { agent };
    console.log('✅ Using proxy:', proxyUrl);
  }

  try {
    console.log('🔐 Hashing password...');
    const hashedPassword = bcrypt.hashSync('123456', 10);
    const id = crypto.randomUUID();
    
    console.log('🔄 Connecting to database...');
    const sql = postgres(process.env.DATABASE_URL, clientOptions);
    
    console.log('💾 Checking if user exists...');
    const existing = await sql`SELECT email FROM "user" WHERE email = 'test@example.com'`;
    
    if (existing.length > 0) {
      console.log('📝 Updating existing user...');
      await sql`UPDATE "user" SET password = ${hashedPassword}, name = 'Test User' WHERE email = 'test@example.com'`;
      console.log('✅ User updated!');
    } else {
      console.log('➕ Creating new user...');
      await sql`INSERT INTO "user" (id, email, name, password) VALUES (${id}, 'test@example.com', 'Test User', ${hashedPassword})`;
      console.log('✅ User created!');
    }
    
    console.log('\n🎉 Success!');
    console.log('Email: test@example.com');
    console.log('Password: 123456');
    console.log('Login at: http://localhost:3000/sign-in');
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

insertUser();
