import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current module's directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Create a new Supabase client for this script
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wmdrcowsgxyzntkbfztc.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZHJjb3dzZ3h5em50a2JmenRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTg5NTcsImV4cCI6MjA2ODA5NDk1N30.YX7qJKpOAEiCrhhkJMisaekZOZsIV_Ym1eGnWHTkWuA',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function applyMigration() {
  try {
    console.log("Starting migration...");
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations/20240720_add_custom_audit_id.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log("\nExecuting migration:");
    console.log("-".repeat(50));
    console.log(migrationSQL);
    console.log("-".repeat(50));
    
    // Split the SQL into individual statements and execute them one by one
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      console.log(`\nExecuting: ${statement.substring(0, 50)}...`);
      const { error } = await supabase.rpc('pg_temp.execute_sql', {
        sql: statement + ';' // Add back the semicolon
      });
      
      if (error) {
        console.error("Error executing statement:", error);
        throw error;
      }
    }
    
    if (error) {
      console.error("Error executing migration:", error);
      throw error;
    }
    
    console.log("\n✅ Migration applied successfully!");
    
    // Verify the migration
    await verifyMigration();
    
  } catch (error) {
    console.error("❌ Error applying migration:", error);
    process.exit(1);
  }
}

async function verifyMigration() {
  try {
    console.log("\nVerifying migration...");
    
    // Check if the custom_audit_id column exists
    const { data: columnCheck, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'audits')
      .eq('column_name', 'custom_audit_id');
    
    if (columnError) throw columnError;
    
    if (columnCheck && columnCheck.length > 0) {
      console.log("✅ Verified: custom_audit_id column exists in audits table");
    } else {
      console.error("❌ Verification failed: custom_audit_id column not found");
      throw new Error("Migration verification failed");
    }
    
    // Check the indexes
    const { data: indexCheck, error: indexError } = await supabase
      .from('pg_indexes')
      .select('*')
      .ilike('indexname', '%idx_audits_custom_audit_id%');
    
    if (indexError) throw indexError;
    
    if (indexCheck && indexCheck.length > 0) {
      console.log("✅ Verified: Index on custom_audit_id exists");
    } else {
      console.error("❌ Verification failed: Index on custom_audit_id not found");
      throw new Error("Migration verification failed - index missing");
    }
    
  } catch (error) {
    console.error("Error during verification:", error);
    throw error;
  }
}

// Run the migration
applyMigration().then(() => {
  console.log("\nMigration process completed.");
  process.exit(0);
}).catch(error => {
  console.error("Migration failed:", error);
  process.exit(1);
});
