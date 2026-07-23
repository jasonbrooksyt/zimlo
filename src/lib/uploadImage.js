import { supabase } from './supabaseClient'

// Uploads a dish photo to the `dish-images` Supabase Storage bucket and
// returns its public URL. Used by the admin Menu screen — see
// supabase/images-setup.sql for the bucket + policies this depends on.
export async function uploadDishImage(file, dishId) {
  if (!file) return { url: null, error: 'No file selected' }
  if (!file.type.startsWith('image/')) return { url: null, error: 'Please choose an image file' }
  if (file.size > 5 * 1024 * 1024) return { url: null, error: 'Image must be under 5MB' }

  const ext = file.name.split('.').pop()
  const path = `${dishId}-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('dish-images')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (uploadError) return { url: null, error: uploadError.message }

  const { data } = supabase.storage.from('dish-images').getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}
