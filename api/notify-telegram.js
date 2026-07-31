// api/notify-telegram.js
// Vercel env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    return res.status(500).json({ error: 'Telegram not configured' })
  }

  const body = req.body || {}
  const text = body.text || formatOrder(body)

  if (!text) {
    return res.status(400).json({ error: 'No message text' })
  }

  try {
    const tgRes = await fetch(
      'https://api.telegram.org/bot' + token + '/sendMessage',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: String(chatId),
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      }
    )
    const data = await tgRes.json()
    if (!data.ok) {
      return res.status(502).json({ error: data.description || 'Telegram API error' })
    }
    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Could not reach Telegram' })
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
    o.paymentMethod ? 'Pay: ' + o.paymentMethod : null
  ]

  // Food items list
  if (Array.isArray(o.items) && o.items.length) {
    lines.push('')
    lines.push('<b>Items:</b>')
    o.items.forEach((it) => {
      const name = it.name || it.nameHi || 'Item'
      const qty = it.qty != null ? it.qty : 1
      const price = it.price != null ? ' — ₹' + it.price : ''
      lines.push('• ' + name + ' × ' + qty + price)
    })
  }

  // Notes / special instructions
  if (o.notes && String(o.notes).trim()) {
    lines.push('')
    lines.push('<b>Notes:</b> ' + String(o.notes).trim())
  }

  // Request / enquiry description
  if (o.requirement && String(o.requirement).trim()) {
    lines.push('')
    lines.push('<b>Description:</b>')
    lines.push(String(o.requirement).trim())
  }

  return lines.filter((x) => x !== null && x !== undefined).join('\n')
}
