// Save as: src/lib/notifyTelegram.js
// Calls serverless API — bot token never goes to the browser

export async function notifyTelegram(payload) {
  try {
    await fetch('/api/notify-telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch (_) {
    // Never block placing an order if Telegram fails
  }
}
