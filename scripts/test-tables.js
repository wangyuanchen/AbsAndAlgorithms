require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function testTables() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log('🔄 Testing table access...\n');

  // Test all tables
  const tables = ['user', 'subscription', 'menu', 'recipe', 'project'];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count || 0} rows`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }

  console.log('\n✅ Table access test complete!');
}

testTables();
