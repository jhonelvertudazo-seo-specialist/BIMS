import { supabase } from './supabaseClient.js';

const BUCKET = 'bims-uploads';

export async function uploadFile(file, folder) {
    if (!file) return null;
    const ext = file.name.split('.').pop();
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
}
