require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function testSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials!');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
  }

  console.log('🔄 Testing Supabase client connection...');
  console.log('URL:', supabaseUrl);

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test connection by querying auth users (simplest test)
    const { data, error } = await supabase.auth.getSession();
    
    if (error && error.message !== 'Auth session missing!') {
      console.error('❌ Connection failed:', error.message);
      process.exit(1);
    }

    console.log('✅ Supabase client connected successfully!');
    console.log('Project URL:', supabaseUrl);

    // Test database query - try to list tables from public schema
    const { data: tables, error: tablesError } = await supabase
      .rpc('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    // If RPC doesn't work, try a simple count query instead
    if (tablesError) {
      console.log('\n📊 Testing database access...');
      // Try to query any existing table - this will fail gracefully if no tables exist
      const testQuery = await supabase.from('users').select('count', { count: 'exact', head: true });
      
      if (testQuery.error) {
        console.log('⚠️  No tables found yet. You can create tables using Drizzle migrations:');
        console.log('   Run: npm run db:migrate');
      } else {
        console.log('✅ Database query successful!');
        console.log('   Users table found with', testQuery.count, 'rows');
      }
    } else if (tables && tables.length > 0) {
      console.log('\n📋 Available tables:');
      tables.forEach(t => console.log('  -', t.tablename));
    } else {
      console.log('\n📋 No tables found. Run migrations to create tables.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

testSupabaseClient();
