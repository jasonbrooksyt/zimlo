// Zimlo — browser GPS + reverse geocoding helpers, used by the "Use my
// current location" button on address fields.
//
// Reverse geocoding uses OpenStreetMap's free Nominatim API (no API key
// needed). It's rate-limited and meant for light/fair use — fine for a
// small-town delivery app's volume. If this ever needs to scale up a lot,
// switching to Google's Geocoding API (paid, needs a key) is the upgrade
// path — swap out reverseGeocode's implementation only.

export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported on this device'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (err) => {
        // Give a friendlier message for the most common case (permission denied).
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error('Location permission denied — please allow location access'))
        } else {
          reject(new Error('Could not get your location'))
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}

export async function reverseGeocode(latitude, longitude) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
  const res = await fetch(url, {
    headers: { Accept: 'application/json' }
  })
  if (!res.ok) throw new Error('Could not look up address for this location')
  const data = await res.json()
  return data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
}

// Convenience wrapper: GPS fix -> human-readable address in one call.
export async function fetchCurrentAddress() {
  const { latitude, longitude } = await getCurrentLocation()
  const address = await reverseGeocode(latitude, longitude)
  return { address, latitude, longitude }
}
