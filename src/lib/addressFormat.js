/** Structured delivery contact used across Checkout, Request forms, Addresses. */
export function emptyAddressFields(defaults = {}) {
  return {
    fullName: defaults.fullName || '',
    addressLine: defaults.addressLine || '',
    landmark: defaults.landmark || '',
    mobile: defaults.mobile || ''
  }
}

/** True when required fields are filled (landmark optional). */
export function isAddressComplete(fields) {
  if (!fields) return false
  const mobileOk = /^[6-9]\d{9}$/.test(String(fields.mobile || '').trim())
  return (
    String(fields.fullName || '').trim().length > 0 &&
    String(fields.addressLine || '').trim().length > 0 &&
    mobileOk
  )
}

/** Single text block stored on orders.address for admin readability. */
export function formatAddressBlock(fields, language = 'en') {
  const nameLabel = language === 'hi' ? 'नाम' : 'Name'
  const addrLabel = language === 'hi' ? 'पता' : 'Address'
  const landLabel = language === 'hi' ? 'लैंडमार्क' : 'Landmark'
  const mobLabel = language === 'hi' ? 'मोबाइल' : 'Mobile'
  const lines = []
  if (fields.fullName?.trim()) lines.push(`${nameLabel}: ${fields.fullName.trim()}`)
  if (fields.addressLine?.trim()) lines.push(`${addrLabel}: ${fields.addressLine.trim()}`)
  if (fields.landmark?.trim()) lines.push(`${landLabel}: ${fields.landmark.trim()}`)
  if (fields.mobile?.trim()) lines.push(`${mobLabel}: +91 ${fields.mobile.trim()}`)
  return lines.join('\n')
}

/** Short one-line preview for chips / lists. */
export function addressPreview(fieldsOrRow) {
  const line =
    fieldsOrRow.addressLine ||
    fieldsOrRow.address_line ||
    ''
  const name = fieldsOrRow.fullName || fieldsOrRow.full_name || ''
  if (name && line) return `${name} — ${line}`
  return line || name || ''
}

/** Map DB row → form fields. */
export function rowToFields(row) {
  return {
    fullName: row.full_name || '',
    addressLine: row.address_line || '',
    landmark: row.landmark || '',
    mobile: row.mobile || ''
  }
}
