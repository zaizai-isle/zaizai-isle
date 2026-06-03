import { getSupabase } from './supabase';
import type { BananaWork } from '../types/banana';

export async function createBananaWork(
  work: Omit<BananaWork, 'id' | 'created_at' | 'likes'>
) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('banana_works')
    .insert({
      original_image_url: work.original_image_url,
      banana_image_url: work.banana_image_url,
      analysis_report: work.analysis_report,
    })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAllBananaWorks(limit = 50, offset = 0): Promise<BananaWork[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('banana_works')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getPopularBananaWorks(limit = 50, offset = 0): Promise<BananaWork[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('banana_works')
    .select('*')
    .order('likes', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function incrementLikes(workId: string) {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('increment_likes', { work_id: workId });
  if (error) throw error;
}

export async function uploadImage(file: File, path: string): Promise<string> {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from('banana_images')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data: urlData } = supabase.storage
    .from('banana_images')
    .getPublicUrl(data.path);
  return urlData.publicUrl;
}
