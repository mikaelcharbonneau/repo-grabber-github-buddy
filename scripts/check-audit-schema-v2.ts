import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a new Supabase client for this script
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wmdrcowsgxyzntkbfztc.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZHJjb3dzZ3h5em50a2JmenRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTg5NTcsImV4cCI6MjA2ODA5NDk1N30.YX7qJKpOAEiCrhhkJMisaekZOZsIV_Ym1eGnWHTkWuA'
);

async function checkAuditSchema() {
  try {
    console.log("Checking audits table schema...");
    
    // Get a sample audit to see what fields exist
    console.log("\nFetching a sample audit...");
    const { data: sampleAudit, error: sampleError } = await supabase
      .from('audits')
      .select('*')
      .limit(1)
      .single();
      
    if (sampleError && sampleError.code !== 'PGRST116') { // PGRST116 means no rows found
      throw sampleError;
    }
    
    console.log("Sample audit:", sampleAudit || "No audits found");
    
    // Check if we can insert a test audit
    console.log("\nAttempting to insert a test audit...");
    const testAudit = {
      title: "Test Audit",
      description: "This is a test audit",
      status: "completed",
      auditor_id: "00000000-0000-0000-0000-000000000000", // This will fail if RLS is enabled
      custom_audit_id: `TEST-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const { data: insertedAudit, error: insertError } = await supabase
      .from('audits')
      .insert([testAudit])
      .select()
      .single();
      
    if (insertError) {
      console.error("Error inserting test audit:", insertError);
      
      // Check if the error is due to missing required fields
      if (insertError.code === '23502') { // not_null_violation
        console.error("\nThis error suggests a required field is missing. Check the error details above.");
      }
      
      // If RLS is enabled, we'll get a permission denied error
      if (insertError.code === '42501') { // insufficient_privilege
        console.error("\nRow Level Security (RLS) is enabled on the audits table. You need to:");
        console.error("1. Authenticate with a valid user session");
        console.error("2. Ensure your RLS policies allow the current user to insert records");
      }
    } else {
      console.log("Successfully inserted test audit:", insertedAudit);
      
      // Clean up
      await supabase
        .from('audits')
        .delete()
        .eq('id', insertedAudit.id);
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
