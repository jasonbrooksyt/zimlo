import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Phone, ShieldCheck } from 'lucide-react'
import { useStore } from '../store/useStore'

// Two-step dummy OTP login: enter phone -> enter OTP -> logged in.
// Any 4-digit OTP is accepted since this is a demo (no real SMS gateway).
// If the user was redirected here from a protected action (e.g. Checkout),
// ProtectedRoute stashes that path in location.state.from — send them back
// there after a successful login instead of always landing on Home.
export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useStore((s) => s.login)
  const language = useStore((s) => s.language)
  const redirectTo = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/home'

  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')

  const t = (hi, en) => (language === 'hi' ? hi : en)

  const handleSendOtp = (e) => {
    e.preventDefault()
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(t('कृपया सही 10 अंकों का मोबाइल नंबर डालें', 'Please enter a valid 10-digit mobile number'))
      return
    }
    setError('')
    setStep('otp')
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    if (otp.length !== 4) {
      setError(t('कृपया 4 अंकों का OTP डालें', 'Please enter the 4-digit OTP'))
      return
    }
    // Dummy verification — any 4-digit code works in this demo.
    login(phone)
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="app-shell flex flex-col justify-center px-6 py-10 min-h-screen">
      <div className="text-center mb-10">
        <img src="/logo.png" alt="Zimlo" className="w-40 h-40 mx-auto object-contain" />
        <p className="font-display font-600 text-lg text-ink mt-2">Jo Chaho, Jahan Chaho, Zimlo Laayega</p>
      </div>

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
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

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-pop active:scale-[0.98] transition"
          >
            {t('OTP भेजें', 'Send OTP')}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <p className="text-sm text-ink/60 mb-3">
              {t('OTP भेजा गया', 'OTP sent to')} <span className="font-semibold text-ink">+91 {phone}</span>
            </p>
            <label className="text-sm font-semibold text-ink/70 mb-1.5 block">
              {t('OTP डालें', 'Enter OTP')}
            </label>
            <div className="flex items-center gap-2 bg-white rounded-2xl shadow-card px-4 py-3.5">
              <ShieldCheck size={18} className="text-primary shrink-0" />
              <input
                type="tel"
                inputMode="numeric"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="1234"
                autoFocus
                className="flex-1 outline-none bg-transparent font-semibold text-ink tracking-[0.3em] placeholder:text-ink/30 placeholder:tracking-normal"
              />
            </div>
            <p className="text-xs text-ink/40 mt-2">
              {t('डेमो के लिए: कोई भी 4 अंक डालें', 'Demo mode: any 4 digits will work')}
            </p>
          </div>

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-pop active:scale-[0.98] transition"
          >
            {t('वेरीफाई करें', 'Verify & Continue')}
          </button>
          <button
            type="button"
            onClick={() => setStep('phone')}
            className="w-full text-ink/60 font-medium text-sm py-2"
          >
            {t('नंबर बदलें', 'Change number')}
          </button>
        </form>
      )}
    </div>
  )
}
