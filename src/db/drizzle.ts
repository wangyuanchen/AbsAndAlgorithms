import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const poolConfig: any = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
};

// 本地开发需要代理连接 LeapCell
if (process.env.USE_PROXY === 'true') {
  const { HttpsProxyAgent } = require('https-proxy-agent');
  poolConfig.ssl = {
    ...poolConfig.ssl,
    agent: new HttpsProxyAgent(process.env.PROXY_URL || 'http://127.0.0.1:7897'),
  };
}

const pool = new Pool(poolConfig);

export const db = drizzle(pool);
