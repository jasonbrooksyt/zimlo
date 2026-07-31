// api/notify-telegram.js — Vercel Serverless Function
// Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (no VITE_ prefix)

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Telegram not configured' }))
    return
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = {}
    }
  }
  body = body || {}

  const text = body.text || formatOrder(body)
  if (!text) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'No message text' }))
    return
  }

  try {
    const tgRes = await fetch(
      'https://api.telegram.org/bot' + token + '/sendMessage',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      }
    )
    const data = await tgRes.json()
    if (!data.ok) {
      res.statusCode = 502
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: data.description || 'Telegram API error' }))
      return
    }
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ ok: true }))
  } catch (e) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: e.message || 'Failed to send' }))
  }
}

function formatOrder(o) {
  if (!o || !o.id) return ''
  const isEnquiry =
    o.paymentMethodPreference === 'enquiry' || o.kind === 'enquiry'
  const title = isEnquiry ? '🔔 New enquiry' : '🛒 New order'
  const lines = [
    '<b>' + title + '</b>',
    'ID: <code>' + o.id + '</code>',
    o.type || o.category ? 'Type: <b>' + (o.type || o.category) + '</b>' : null,
    o.customerPhone ? 'Phone: ' + o.customerPhone : null,
    o.address ? 'Address: ' + o.address : null,
    o.total != null ? 'Total: ₹' + o.total : null,
    o.paymentMethod ? 'Pay: ' + o.paymentMethod : null,
    o.requirement ? '\n' + o.requirement : null
  ]
  return lines.filter(Boolean).join('\n')
}
