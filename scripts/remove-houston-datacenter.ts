import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a new Supabase client for this script
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wmdrcowsgxyzntkbfztc.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZHJjb3dzZ3h5em50a2JmenRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTg5NTcsImV4cCI6MjA2ODA5NDk1N30.YX7qJKpOAEiCrhhkJMisaekZOZsIV_Ym1eGnWHTkWuA'
);

async function removeHoustonDatacenter() {
  try {
    console.log('Starting Houston datacenter removal...');
    
    // First, find the Houston datacenter
    const { data: houstonDC, error: dcError } = await supabase
      .from('datacenters')
      .select('id, name')
      .ilike('name', '%houston%')
      .single();
    
    if (dcError && dcError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error finding Houston datacenter:', dcError);
      throw dcError;
    }
    
    if (!houstonDC) {
      console.log('Houston datacenter not found in database. Nothing to remove.');
      return;
    }
    
    console.log('Found Houston datacenter:', houstonDC);
    
    // Find all datahalls in Houston
    const { data: houstonDatahalls, error: dhError } = await supabase
      .from('datahalls')
      .select('id, name')
      .eq('datacenter_id', houstonDC.id);
    
    if (dhError) {
      console.error('Error finding Houston datahalls:', dhError);
      throw dhError;
    }
    
    console.log(`Found ${houstonDatahalls?.length || 0} datahalls in Houston`);
    
    // Remove tile locations for Houston datahalls
    if (houstonDatahalls && houstonDatahalls.length > 0) {
      const datahallIds = houstonDatahalls.map(dh => dh.id);
      
      console.log('Removing tile locations...');
      const { error: tlError } = await supabase
        .from('tile_locations')
        .delete()
        .in('datahall_id', datahallIds);
      
      if (tlError) {
        console.error('Error removing tile locations:', tlError);
        throw tlError;
      }
      
      console.log('Tile locations removed successfully');
      
      // Remove datahalls
      console.log('Removing datahalls...');
      const { error: dhDeleteError } = await supabase
        .from('datahalls')
        .delete()
        .eq('datacenter_id', houstonDC.id);
      
      if (dhDeleteError) {
        console.error('Error removing datahalls:', dhDeleteError);
        throw dhDeleteError;
      }
      
      console.log('Datahalls removed successfully');
    }
    
    // Finally, remove the Houston datacenter
    console.log('Removing Houston datacenter...');
    const { error: dcDeleteError } = await supabase
      .from('datacenters')
      .delete()
      .eq('id', houstonDC.id);
    
    if (dcDeleteError) {
      console.error('Error removing Houston datacenter:', dcDeleteError);
      throw dcDeleteError;
    }
    
    console.log('✅ Houston datacenter removed successfully!');
    
    // Verify removal
    const { data: verifyDC, error: verifyError } = await supabase
      .from('datacenters')
      .select('name')
      .ilike('name', '%houston%');
    
    if (verifyError) {
      console.error('Error verifying removal:', verifyError);
    } else if (verifyDC && verifyDC.length === 0) {
      console.log('✅ Verified: Houston datacenter has been completely removed');
    } else {
      console.warn('⚠️ Warning: Houston datacenter may still exist in database');
    }
    
  } catch (error) {
    console.error('❌ Error removing Houston datacenter:', error);
    throw error;
  }
}

// Run the removal
removeHoustonDatacenter().then(() => {
  console.log('\nHouston datacenter removal process completed.');
  process.exit(0);
}).catch(error => {
  console.error('Houston datacenter removal failed:', error);
  process.exit(1);
});