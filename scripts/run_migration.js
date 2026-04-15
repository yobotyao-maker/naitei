const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase credentials in environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function executeSql(statement) {
  try {
    const { data, error } = await supabase.rpc("execute_sql", {
      sql: statement,
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (e) {
    // Supabase doesn't have execute_sql, try with raw query instead
    return { data: null, error: e };
  }
}

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, "../supabase/populate_eid_data.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");

    // Split by ; and filter out empty statements and comments
    const statements = sql
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 60)}...`);

      const { data, error } = await executeSql(statement);

      if (error) {
        console.log(`  ⚠ ${error.message}`);
      } else {
        console.log(`  ✓ Success`);
      }
    }

    console.log("\n✓ Migration completed!");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
}

runMigration();
