/** Load the Supabase SDK only when a feature actually needs remote data. */
export async function getSupabaseClient() {
  const { getOptionalSupabase } = await import('./supabaseClient');
  return getOptionalSupabase();
}
