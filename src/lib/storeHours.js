import {
  STORE_OPEN_HOUR,
  STORE_OPEN_MINUTE,
  STORE_CLOSE_HOUR,
  STORE_CLOSE_MINUTE
} from '../data/menuData'

/** Current time parts in Asia/Kolkata (IST). */
function getISTParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    weekday: 'short'
  })
  const parts = Object.fromEntries(
    fmt.formatToParts(date).filter((p) => p.type !== 'literal').map((p) => [p.type, p.value])
  )
  // hour12:false can still yield "24" in some engines for midnight — normalize
  let hour = Number(parts.hour)
  if (hour === 24) hour = 0
  return {
    hour,
    minute: Number(parts.minute),
    weekday: parts.weekday
  }
}

function minutesSinceMidnight(h, m) {
  return h * 60 + m
}

const OPEN_MIN = minutesSinceMidnight(STORE_OPEN_HOUR, STORE_OPEN_MINUTE)
const CLOSE_MIN = minutesSinceMidnight(STORE_CLOSE_HOUR, STORE_CLOSE_MINUTE)

/**
 * Whether the store is currently accepting orders (IST).
 * Supports overnight windows (e.g. 22:00–06:00) if close < open.
 */
export function isStoreOpen(date = new Date()) {
  const { hour, minute } = getISTParts(date)
  const now = minutesSinceMidnight(hour, minute)
  if (CLOSE_MIN > OPEN_MIN) {
    // Same-day window, e.g. 09:00–23:00
    return now >= OPEN_MIN && now < CLOSE_MIN
  }
  // Overnight window, e.g. 22:00–06:00
  return now >= OPEN_MIN || now < CLOSE_MIN
}

function pad(n) {
  return String(n).padStart(2, '0')
}

/** "9:00 AM" / "11:00 PM" style label. */
export function formatStoreTime(hour, minute, language = 'hi') {
  const h12 = hour % 12 || 12
  const ampm = hour < 12 ? (language === 'hi' ? 'सुबह' : 'AM') : hour < 16 ? (language === 'hi' ? 'दोपहर' : 'PM') : (language === 'hi' ? 'रात' : 'PM')
  // Prefer simple AM/PM for English; for Hindi use सुबह/दोपहर/शाम/रात lightly
  if (language === 'en') {
    const suffix = hour < 12 ? 'AM' : 'PM'
    return minute === 0 ? `${h12}:00 ${suffix}` : `${h12}:${pad(minute)} ${suffix}`
  }
  // Hindi: "सुबह 9:00" / "रात 11:00"
  let period = 'सुबह'
  if (hour >= 12 && hour < 16) period = 'दोपहर'
  else if (hour >= 16 && hour < 20) period = 'शाम'
  else if (hour >= 20 || hour < 5) period = 'रात'
  const timeStr = minute === 0 ? `${h12}:00` : `${h12}:${pad(minute)}`
  return `${period} ${timeStr}`
}

export function getOpenTimeLabel(language = 'hi') {
  return formatStoreTime(STORE_OPEN_HOUR, STORE_OPEN_MINUTE, language)
}

export function getCloseTimeLabel(language = 'hi') {
  return formatStoreTime(STORE_CLOSE_HOUR, STORE_CLOSE_MINUTE, language)
}

/**
 * Next opening Date (approx) and human countdown string.
 * Returns { opensAt: Date, labelHi, labelEn, minutesUntil }
 */
export function getNextOpenInfo(date = new Date()) {
  const { hour, minute } = getISTParts(date)
  const nowMin = minutesSinceMidnight(hour, minute)

  // Build a Date in IST conceptually: we compute delta minutes then add to `date`.
  let deltaMin
  if (CLOSE_MIN > OPEN_MIN) {
    // closed overnight until OPEN next morning (or later today if before open)
    if (nowMin < OPEN_MIN) {
      deltaMin = OPEN_MIN - nowMin
    } else {
      // after close → next day open
      deltaMin = 24 * 60 - nowMin + OPEN_MIN
    }
  } else {
    // overnight open window — closed only between CLOSE and OPEN
    if (nowMin >= CLOSE_MIN && nowMin < OPEN_MIN) {
      deltaMin = OPEN_MIN - nowMin
    } else {
      deltaMin = 0
    }
  }

  const opensAt = new Date(date.getTime() + deltaMin * 60 * 1000)
  const minutesUntil = Math.max(0, Math.round(deltaMin))

  let labelEn
  let labelHi
  if (minutesUntil <= 0) {
    labelEn = 'Open now'
    labelHi = 'अभी खुला है'
  } else if (minutesUntil < 60) {
    labelEn = `Opens in ${minutesUntil} min`
    labelHi = `${minutesUntil} मिनट में खुलेगा`
  } else if (minutesUntil < 24 * 60) {
    const h = Math.floor(minutesUntil / 60)
    const m = minutesUntil % 60
    labelEn = m ? `Opens in ${h}h ${m}m` : `Opens in ${h}h`
    labelHi = m ? `${h} घंटे ${m} मिनट में खुलेगा` : `${h} घंटे में खुलेगा`
  } else {
    labelEn = `Opens at ${formatStoreTime(STORE_OPEN_HOUR, STORE_OPEN_MINUTE, 'en')}`
    labelHi = `${formatStoreTime(STORE_OPEN_HOUR, STORE_OPEN_MINUTE, 'hi')} को खुलेगा`
  }

  return { opensAt, labelHi, labelEn, minutesUntil }
}
