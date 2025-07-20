import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wmdrcowsgxyzntkbfztc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZHJjb3dzZ3h5em50a2JmenRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTg5NTcsImV4cCI6MjA2ODA5NDk1N30.YX7qJKpOAEiCrhhkJMisaekZOZsIV_Ym1eGnWHTkWuA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndUpdateSchema() {
  try {
    console.log('Checking current database schema...');
    
    // Check if custom_audit_id column exists
    const { data: columnCheck, error: columnError } = await supabase
      .rpc('column_exists', { 
        table_name: 'audits',
        column_name: 'custom_audit_id'
      });

    if (columnError) {
      console.error('Error checking for column:', columnError);
      // If the function doesn't exist, we'll try to add the column directly
      await addCustomAuditIdColumn();
    } else if (!columnCheck) {
      console.log('Column custom_audit_id does not exist. Adding it now...');
      await addCustomAuditIdColumn();
    } else {
      console.log('Column custom_audit_id already exists.');
    }

    // Check and add other columns if needed
    await checkAndAddColumn('datacenter_id', 'UUID');
    await checkAndAddColumn('datahall_id', 'UUID');
    await checkAndAddColumn('start_time', 'TIMESTAMPTZ');
    await checkAndAddColumn('end_time', 'TIMESTAMPTZ');

    // Create index if it doesn't exist
    await createIndexIfNotExists();
    
    console.log('Schema update completed successfully!');
  } catch (error) {
    console.error('Error updating schema:', error);
  }
}

async function checkAndAddColumn(columnName: string, columnType: string) {
  try {
    const { data: columnCheck, error } = await supabase
      .rpc('column_exists', { 
        table_name: 'audits',
        column_name: columnName
      });

    if (error) {
      console.error(`Error checking for column ${columnName}:`, error);
      return;
    }

    if (!columnCheck) {
      console.log(`Column ${columnName} does not exist. Adding it now...`);
      const { error: alterError } = await supabase.rpc('execute_sql', {
        query: `ALTER TABLE audits ADD COLUMN ${columnName} ${columnType}${columnName.endsWith('_id') ? ' REFERENCES ' + columnName.replace('_id', 's') + '(id)' : ''}`
      });

      if (alterError) {
        console.error(`Error adding column ${columnName}:`, alterError);
      } else {
        console.log(`Column ${columnName} added successfully.`);
      }
    } else {
      console.log(`Column ${columnName} already exists.`);
    }
  } catch (error) {
    console.error(`Error in checkAndAddColumn for ${columnName}:`, error);
  }
}

async function addCustomAuditIdColumn() {
  try {
    const { error } = await supabase.rpc('execute_sql', {
      query: 'ALTER TABLE audits ADD COLUMN IF NOT EXISTS custom_audit_id TEXT UNIQUE'
    });

    if (error) throw error;
    console.log('Added custom_audit_id column with UNIQUE constraint.');
  } catch (error) {
    console.error('Error adding custom_audit_id column:', error);
  }
}

async function createIndexIfNotExists() {
  try {
    const { error } = await supabase.rpc('execute_sql', {
      query: 'CREATE INDEX IF NOT EXISTS idx_audits_custom_audit_id ON audits(custom_audit_id)'
    });

    if (error) throw error;
    console.log('Created index on custom_audit_id column.');
  } catch (error) {
    console.error('Error creating index:', error);
  }
}

// Run the schema check and update
checkAndUpdateSchema().then(() => {
  console.log('Schema check and update process completed.');  
  process.exit(0);
}).catch(error => {
  console.error('Error during schema update:', error);
  process.exit(1);
});
