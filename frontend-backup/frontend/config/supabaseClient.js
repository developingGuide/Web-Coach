import { createClient } from '@supabase/supabase-js';

// console.log(import.meta.env.VITE_API_KEY);


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase