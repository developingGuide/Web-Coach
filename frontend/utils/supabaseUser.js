import { supabase } from '../supabaseClient';

export async function getOrCreateUser(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (data) return data;

  // If user doesn't exist, create one
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert([
      {
        user_id: userId,
        current_project: null,
        shipped_tasks: [],
      },
    ])
    .select()
    .single();

  return newUser;
}
