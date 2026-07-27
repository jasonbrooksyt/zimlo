import { supabase } from './supabaseClient'

// Uploads a photo attached to a Bakery/Grocery/Medicine/Parcel/Custom
// request (e.g. a prescription, a reference image, a handwritten list) to
// the `request-attachments` Supabase Storage bucket and returns its
// public URL. See supabase/features-round2-setup.sql for the bucket setup.
export async function uploadAttachment(file) {
  if (!file) return { url: null, error: 'No file selected' }
  if (!file.type.startsWith('image/')) return { url: null, error: 'Please choose an image file' }
  if (file.size > 5 * 1024 * 1024) return { url: null, error: 'Image must be under 5MB' }

  const ext = file.name.split('.').pop()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('request-attachments')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (uploadError) return { url: null, error: uploadError.message }

  const { data } = supabase.storage.from('request-attachments').getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}
