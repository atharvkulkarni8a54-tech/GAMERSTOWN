
import { supabase } from './supabase';

async function testSupabaseConnection() {
  const { error } = await supabase
    .from('pricing_packages')
    .select('id')
    .limit(1);

  if (error) {
    console.error('Supabase connection test failed:', error.message);
    return;
  }

  console.log('Supabase connection successful.');
}

void testSupabaseConnection();
