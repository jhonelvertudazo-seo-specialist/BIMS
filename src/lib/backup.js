import { supabase } from './supabaseClient.js';

const BUCKET = 'bims-backups';

export async function runDatabaseBackup({ residents, households, certificates, blotters }, createdByEmail) {
    const recordCounts = {
        residents: residents.length,
        households: households.length,
        certificates: certificates.length,
        blotters: blotters.length,
    };

    const snapshot = { generatedAt: new Date().toISOString(), recordCounts, residents, households, certificates, blotters };
    const json = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([json], { type: 'application/json' });

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `bims-backup-${stamp}.json`;
    const path = `backups/${fileName}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, blob, {
        contentType: 'application/json',
        upsert: false,
    });
    if (uploadError) throw uploadError;

    const { data, error: insertError } = await supabase
        .from('database_backups')
        .insert({
            file_path: path,
            file_name: fileName,
            size_bytes: blob.size,
            record_counts: recordCounts,
            created_by: createdByEmail || null,
        })
        .select()
        .single();
    if (insertError) throw insertError;
    return data;
}

export async function listDatabaseBackups() {
    const { data, error } = await supabase
        .from('database_backups')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function downloadDatabaseBackup(filePath, fileName) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(filePath, 60);
    if (error) throw error;
    const link = document.createElement('a');
    link.href = data.signedUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
}
