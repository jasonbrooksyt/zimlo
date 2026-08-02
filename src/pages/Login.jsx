import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Phone, AlertTriangle } from 'lucide-react'
import { useStore } from '../store/useStore'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const REDIRECT_KEY = 'zimlo_pending_redirect'

// Google Sign-In, linked onto the customer's existing anonymous Supabase
// session (see useCustomerSession) so their auth.uid() — and anything
// already tied to it — stays the same rather than switching identities.
//
// Google doesn't hand us a phone number, but Zimlo needs one to actually
// deliver an order, so first-time sign-in asks for it once (no OTP, just
// entered — the admin already verifies orders manually before dispatch).
//
// Because OAuth is a full-page redirect (browser leaves the app and comes
// back), the "where to return to" info can't live in React Router state —
// it's stashed in localStorage before leaving and read back after.
export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useStore((s) => s.login)
  const language = useStore((s) => s.language)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const [checking, setChecking] = useState(true)
  const [googleProfile, setGoogleProfile] = useState(null) // { name, email } once Google auth completes
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // On mount: are we returning from Google's redirect? If so, pick up
  // where we left off instead of showing the "Continue with Google" button.
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setChecking(false)
      return
    }

    if (location.state?.from) {
      // Arrived here via a protected page's redirect — remember exactly
      // where to send the customer back to once sign-in finishes.
      const redirectTo = `${location.state.from.pathname}${location.state.from.search || ''}`
      localStorage.setItem(REDIRECT_KEY, redirectTo)
    } else if (!localStorage.getItem(REDIRECT_KEY)) {
      // A direct visit to /login with nothing already pending.
      localStorage.setItem(REDIRECT_KEY, '/home')
    }
    // else: this is the page reload after returning from Google — router
    // state doesn't survive a full-page redirect, so we deliberately leave
    // whatever's already in localStorage untouched here.

    // If Google redirect failed (e.g. identity_already_exists), Supabase may
    // bounce back with ?error=... on / or /login. Show a clean message and
    // strip the ugly query string from the address bar.
    const params = new URLSearchParams(window.location.search)
    const errCode = params.get('error_code') || ''
    const errDesc = params.get('error_description') || params.get('error') || ''
    if (errCode || errDesc) {
      if (errCode === 'identity_already_exists' || errDesc.includes('already linked')) {
        setError(
          t(
            'यह Google account पहले से लिंक है — कृपया दोबारा "Continue with Google" दबाएँ',
            'This Google account is already linked — please tap Continue with Google again'
          )
        )
      } else {
        setError(errDesc.replace(/\+/g, ' ') || errCode)
      }
      window.history.replaceState({}, '', window.location.pathname)
    }

    supabase.auth.getSession().then(({ data }) => {
      const session = data.session
      const isReal = session && !session.user.is_anonymous
      if (isReal) {
        const meta = session.user.user_metadata || {}
        setGoogleProfile({
          name: meta.full_name || meta.name || '',
          email: session.user.email
        })
      }
      setChecking(false)
    })
  }, [])

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      setError(t('लॉगिन सेवा अभी सेटअप नहीं है', 'Login service is not set up yet'))
      return
    }
    setError('')
    setLoading(true)

    // Prefer linkIdentity so the existing anonymous session (and its orders)
    // keeps the same auth.uid(). If this Google account is already linked to
    // a *different* Supabase user, linkIdentity fails with
    // identity_already_exists — fall back to a normal OAuth sign-in into
    // that existing account instead of showing a cryptic error.
    const { error: linkError } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/login` }
    })

    if (!linkError) {
      // Browser navigates away to Google — nothing more to do here.
      return
    }

    const msg = (linkError.message || '').toLowerCase()
    const code = (linkError.code || '').toLowerCase()
    const alreadyLinked =
      code === 'identity_already_exists' ||
      msg.includes('identity_already_exists') ||
      msg.includes('already linked') ||
      msg.includes('identity is already')

    if (alreadyLinked) {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/login` }
      })
      if (oauthError) {
        setLoading(false)
        setError(oauthError.message)
      }
      // Success → browser leaves for Google
      return
    }

    setLoading(false)
    setError(linkError.message)
  }

  const handlePhoneSubmit = (e) => {
    e.preventDefault()
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(t('कृपया सही 10 अंकों का मोबाइल नंबर डालें', 'Please enter a valid 10-digit mobile number'))
      return
    }
    login({ ...googleProfile, phone })
    const redirectTo = localStorage.getItem(REDIRECT_KEY) || '/home'
    localStorage.removeItem(REDIRECT_KEY)
    navigate(redirectTo, { replace: true })
  }

  if (checking) {
    return <div className="app-shell min-h-screen" />
  }

  return (
    <div className="app-shell flex flex-col justify-center px-6 py-10 min-h-screen">
      <div className="text-center mb-10">
        <img src="/logo.png" alt="Zimlo" className="w-40 h-40 mx-auto object-contain" />
        <p className="font-display font-600 text-lg text-ink mt-2">Jo Chaho, Jahan Chaho, Zimlo Laayega</p>
      </div>

      {!isSupabaseConfigured && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            {t('लॉगिन सेवा सेटअप नहीं है', 'Login service is not configured yet.')}
          </p>
        </div>
      )}

      {googleProfile ? (
        // Step 2: Google sign-in done — collect a delivery contact number.
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <p className="text-sm text-ink/60 mb-1">
            {t('स्वागत है', 'Welcome')}, <span className="font-semibold text-ink">{googleProfile.name}</span> 👋
          </p>
          <div>
            <label className="text-sm font-semibold text-ink/70 mb-1.5 block">
              {t('डिलीवरी के लिए मोबाइल नंबर', 'Mobile number for delivery')}
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
                autoFocus
                className="flex-1 outline-none bg-transparent font-semibold text-ink placeholder:text-ink/30"
              />
            </div>
            <p className="text-xs text-ink/40 mt-2">
              {t(
                'ऑर्डर डिलीवर करने के लिए यह ज़रूरी है',
                "We'll use this to reach you about your order"
              )}
            </p>
          </div>

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-pop active:scale-[0.98] transition"
          >
            {t('जारी रखें', 'Continue')}
          </button>
        </form>
      ) : (
        // Step 1: Continue with Google.
        <div className="space-y-4">
          {error && <p className="text-red-600 text-sm font-medium text-center">{error}</p>}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-black/10 text-ink font-bold py-3.5 rounded-2xl shadow-card active:scale-[0.98] transition disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-4z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.4 19 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 15.9 3 8.9 7.6 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.4 26.7 37 24 37c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9 41.5 15.9 45 24 45z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C40.4 36.3 44 30.7 44 24c0-1.4-.1-2.7-.4-3.5z" />
            </svg>
            {loading ? t('कृपया प्रतीक्षा करें...', 'Please wait...') : t('Google से जारी रखें', 'Continue with Google')}
          </button>
        </div>
      )}
    </div>
  )
}
