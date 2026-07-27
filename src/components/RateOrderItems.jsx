import { useEffect, useState } from 'react'
import { Star, Check } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { useStore } from '../store/useStore'

// Shown on a delivered Food order — lets the customer rate each dish they
// ordered (1-5 stars). Ratings feed straight into `dish_ratings`, which
// useDishes.js aggregates into the real avgRating/ratingCount shown
// everywhere else in the app.
export default function RateOrderItems({ order }) {
  const language = useStore((s) => s.language)
  const t = (hi, en) => (language === 'hi' ? hi : en)
  const [existingRatings, setExistingRatings] = useState({}) // { dishId: rating }
  const [saving, setSaving] = useState(null) // dishId currently being saved

  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase
      .from('dish_ratings')
      .select('dish_id, rating')
      .eq('order_id', order.id)
      .then(({ data }) => {
        if (!data) return
        const map = {}
        data.forEach((r) => (map[r.dish_id] = r.rating))
        setExistingRatings(map)
      })
  }, [order.id])

  const handleRate = async (dishId, rating) => {
    setSaving(dishId)
    const { data: authData } = await supabase.auth.getUser()
    if (authData?.user) {
      await supabase
        .from('dish_ratings')
        .upsert(
          { dish_id: dishId, order_id: order.id, user_id: authData.user.id, rating },
          { onConflict: 'dish_id,order_id,user_id' }
        )
      setExistingRatings((prev) => ({ ...prev, [dishId]: rating }))
    }
    setSaving(null)
  }

  if (!isSupabaseConfigured || !order.items?.length) return null

  return (
    <div className="bg-white rounded-2xl shadow-card p-4 mt-4">
      <p className="font-display font-700 text-sm text-ink mb-3">
        {t('इस ऑर्डर को रेट करें', 'Rate your order')}
      </p>
      <div className="space-y-3">
        {order.items.map((item) => {
          const rating = existingRatings[item.id] || 0
          return (
            <div key={item.id} className="flex items-center justify-between gap-2">
              <span className="text-sm text-ink/80 truncate flex-1">
                {language === 'hi' ? item.nameHi : item.name}
              </span>
              <div className="flex items-center gap-0.5 shrink-0">
                {rating > 0 && saving !== item.id ? (
                  <span className="flex items-center gap-1 text-green-600 text-xs font-semibold mr-1">
                    <Check size={13} /> {t('रेट किया', 'Rated')}
                  </span>
                ) : null}
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(item.id, star)}
                    disabled={saving === item.id}
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      size={18}
                      className={star <= rating ? 'text-accent' : 'text-ink/20'}
                      fill={star <= rating ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
