import { supabase } from './supabaseClient'

// Uploads a customer's profile photo to the `profile-photos` Supabase
// Storage bucket and returns its public URL — same pattern as
// uploadImage.js (dish photos), see supabase/features-round2-setup.sql.
export async function uploadProfilePhoto(file, userId) {
  if (!file) return { url: null, error: 'No file selected' }
  if (!file.type.startsWith('image/')) return { url: null, error: 'Please choose an image file' }
  if (file.size > 5 * 1024 * 1024) return { url: null, error: 'Image must be under 5MB' }

  const ext = file.name.split('.').pop()
  const path = `${userId}-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('profile-photos')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (uploadError) return { url: null, error: uploadError.message }

  const { data } = supabase.storage.from('profile-photos').getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}
