#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Get Supabase database connection string
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Parse Supabase URL to get project reference
const projectRef = supabaseUrl.split('//')[1].split('.')[0];
const connectionString = `postgresql://postgres:[PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`;

// For Supabase, we need to use the service role key for authentication
// Since we can't directly use the JWT, we'll read the migration file and provide instructions

async function main() {
  try {
    const migrationPath = path.join(__dirname, '../supabase/migrations/20260415_populate_eid_data.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📋 Migration SQL loaded successfully');
    console.log('');
    console.log('🔐 To execute this migration in Supabase:');
    console.log('');
    console.log('1. Visit: https://app.supabase.com/');
    console.log('2. Select your "naitei" project');
    console.log('3. Go to SQL Editor → New Query');
    console.log('4. Paste and run this SQL:');
    console.log('');
    console.log('─'.repeat(60));
    console.log(sql);
    console.log('─'.repeat(60));
    console.log('');
    console.log('✅ After execution, verify with:');
    console.log('');
    console.log('SELECT COUNT(*) FROM interviews WHERE eid IS NOT NULL;');
    console.log('SELECT COUNT(*) FROM design_sessions WHERE interviewee_eid IS NOT NULL;');
    console.log('');

    // Try to provide a direct execution method if possible
    console.log('🚀 Alternatively, you can execute the migration by:');
    console.log('   npm run migrate:eid (when implementation is ready)');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
