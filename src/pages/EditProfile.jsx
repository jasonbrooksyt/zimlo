import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, User, Phone, Loader2 } from 'lucide-react'
import Header from '../components/Header'
import { useStore } from '../store/useStore'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { uploadProfilePhoto } from '../lib/uploadProfilePhoto'

// Lets the customer set a profile photo, edit their display name, and
// correct their delivery phone number. Saved both to Supabase's
// user_metadata (so it follows them across devices on the same Google
// account) and to the local store (for instant display everywhere).
export default function EditProfile() {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const user = useStore((s) => s.user)
  const login = useStore((s) => s.login)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(user?.avatarUrl || null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handlePhotoChange = (file) => {
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(t('कृपया सही 10 अंकों का मोबाइल नंबर डालें', 'Please enter a valid 10-digit mobile number'))
      return
    }
    setError('')
    setSaving(true)

    let avatarUrl = user?.avatarUrl || null
    if (isSupabaseConfigured) {
      const { data: authData } = await supabase.auth.getUser()
      if (photoFile && authData?.user) {
        const { url, error: uploadError } = await uploadProfilePhoto(photoFile, authData.user.id)
        if (uploadError) {
          setError(uploadError)
          setSaving(false)
          return
        }
        avatarUrl = url
      }

      await supabase.auth.updateUser({
        data: { full_name: name.trim(), phone, avatar_url: avatarUrl }
      })
    }

    login({ ...user, name: name.trim(), phone, avatarUrl })
    setSaving(false)
    navigate('/profile')
  }

  return (
    <div className="app-shell pb-10">
      <Header back title="Edit Profile" titleHi="प्रोफाइल एडिट करें" />

      <div className="px-4 pt-4 space-y-5">
        <div className="flex justify-center">
          <label className="relative cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-primary" />
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-card">
              <Camera size={15} className="text-white" />
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhotoChange(e.target.files?.[0])}
            />
          </label>
        </div>

        <div>
          <label className="text-sm font-semibold text-ink/70 mb-1.5 block">
            {t('नाम', 'Name')}
          </label>
          <div className="flex items-center gap-2 bg-white rounded-2xl shadow-card px-4 py-3.5">
            <User size={18} className="text-primary shrink-0" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('आपका नाम', 'Your name')}
              className="flex-1 outline-none bg-transparent font-semibold text-ink placeholder:text-ink/30"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-ink/70 mb-1.5 block">
            {t('मोबाइल नंबर', 'Mobile Number')}
          </label>
          <div className="flex items-center gap-2 bg-white rounded-2xl shadow-card px-4 py-3.5">
            <Phone size={18} className="text-primary shrink-0" />
            <span className="text-ink/60 font-medium">+91</span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder={t('10 अंकों का नंबर', '10-digit number')}
              className="flex-1 outline-none bg-transparent font-semibold text-ink placeholder:text-ink/30"
            />
          </div>
        </div>

        {user?.email && (
          <p className="text-xs text-ink/40 px-1">
            {t('Google अकाउंट', 'Google account')}: {user.email}
          </p>
        )}

        {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-2xl shadow-pop active:scale-[0.98] transition disabled:opacity-50"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? t('सेव हो रहा है...', 'Saving...') : t('सेव करें', 'Save')}
        </button>
      </div>
    </div>
  )
}
