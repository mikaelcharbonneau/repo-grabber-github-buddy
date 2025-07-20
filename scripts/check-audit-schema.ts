// Script to check the audits table schema
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a custom storage implementation for Node.js
const storage = {
  getItem: (key: string) => {
    return null; // Not needed for this script
  },
  setItem: (key: string, value: string) => {
    // Not needed for this script
  },
  removeItem: (key: string) => {
    // Not needed for this script
  },
};

// Create a new Supabase client for this script
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wmdrcowsgxyzntkbfztc.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZHJjb3dzZ3h5em50a2JmenRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTg5NTcsImV4cCI6MjA2ODA5NDk1N30.YX7qJKpOAEiCrhhkJMisaekZOZsIV_Ym1eGnWHTkWuA',
  {
    auth: {
      storage: storage,
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

async function checkAuditSchema() {
  try {
    console.log("Checking audits table schema...");
    
    // Get table info
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_name', 'audits');
      
    if (tableError) throw tableError;
    console.log("Table info:", tableInfo);
    
    // Get columns info
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'audits');
      
    if (columnsError) throw columnsError;
    console.log("\nColumns in audits table:");
    console.table(columns);
    
    // Check constraints
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'audits');
      
    if (constraintsError) throw constraintsError;
    console.log("\nTable constraints:");
    console.table(constraints);
    
    // Check indexes
    const { data: indexes, error: indexesError } = await supabase
      .rpc('get_indexes', { table_name: 'audits' });
      
    if (indexesError) {
      console.log("\nCould not retrieve indexes (function might not exist):", indexesError.message);
    } else {
      console.log("\nTable indexes:");
      console.table(indexes);
    }
    
    // Check RLS policies
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_rls_policies', { table_name: 'audits' });
      
    if (policiesError) {
      console.log("\nCould not retrieve RLS policies (function might not exist):", policiesError.message);
    } else {
      console.log("\nRow Level Security Policies:");
      console.table(policies);
    }
    
  } catch (error) {
    console.error("Error checking audit schema:", error);
  }
}

// Run the check
checkAuditSchema().then(() => {
  console.log("\nAudit schema check complete");
  process.exit(0);
}).catch(error => {
  console.error("Error in schema check:", error);
  process.exit(1);
});
