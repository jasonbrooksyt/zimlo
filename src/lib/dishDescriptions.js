/**
 * Prefer real dish.description from DB, but replace obvious AI-boilerplate
 * with short unique blurbs so the menu doesn\'t look copy-pasted.
 */

const BOILERPLATE_HINTS = [
  'हर निवाले',
  'हर निवाले',
  'pakakar taiyar',
  'पकाकर तैयार',
  'खुशबूदार मसालों',
  'swaad aur',
  'प्रतिनिधित्व',
]

const BY_NAME = {
  'jeera rice': 'Jeera-tempered basmati, light and aromatic — perfect with dal or curry.',
  'जीरा राइस': 'जीरा तड़का बासमती चावल — दाल या करी के साथ बेस्ट।',
  'masala rice': 'Spiced rice with veggies and house masala, weekday comfort in a bowl.',
  'मसाला राइस': 'सब्ज़ी और घर के मसाले वाला तड़का राइस।',
  'aloo chola': 'Soft potatoes with tangy chole gravy — street-style North Indian classic.',
  'आलू छोला': 'नर्म आलू और खट्टे-मीठे छोले — स्ट्रीट-स्टाइल स्वाद।',
  'chana masala': 'Chickpeas slow-cooked in onion-tomato masala, bold and filling.',
  'चना मसाला': 'प्याज़-टमाटर मसाले में धीमी आँच पर पके चने।',
  'dal fry': 'Yellow dal with ghee tadka of cumin, garlic and red chilli.',
  'दाल फ्राई': 'घी तड़के वाली पीली दाल — जीरा, लहसुन, लाल मिर्च।',
  'dal tadka': 'Home-style tadka dal, simple and satisfying.',
  'दाल तड़का': 'घर जैसा तड़का दाल।',
  'paneer butter masala': 'Paneer in a rich, creamy tomato-butter gravy.',
  'पनीर बटर मसाला': 'क्रीमी टमाटर-बटर ग्रेवी में पनीर।',
  'samosa': 'Crispy pastry with spiced potato filling — best with chutney.',
  'समोसा': 'कुरकुरा समोसा, मसालेदार आलू भरावन।',
  'kachori': 'Flaky fried kachori, ideal with evening chai.',
  'कचौड़ी': 'खस्ता कचौड़ी — चाय के साथ।',
  'pani puri': 'Crisp puris with spicy-tangy pani and filling.',
  'पानी पूरी': 'कुरकुरी पूरी, तीखा-खट्टा पानी।',
  'pav bhaji': 'Buttery mashed veg bhaji with toasted pav.',
  'पाव भाजी': 'मक्खन वाली भाजी और टोस्टेड पाव।',
  'poha': 'Light flattened-rice poha with peanut and onion crunch.',
  'पोहा': 'मूंगफली और प्याज़ वाला हल्का पोहा।',
}

function looksBoilerplate(text) {
  if (!text || text.length < 40) return false
  const lower = text.toLowerCase()
  return BOILERPLATE_HINTS.some((h) => text.includes(h) || lower.includes(h.toLowerCase()))
}

export function getDishDescription(dish, language = 'en') {
  const raw = (dish?.description || '').trim()
  const nameKey = (language === 'hi' ? dish?.nameHi : dish?.name) || dish?.name || ''
  const key = nameKey.toLowerCase().trim()
  const override = BY_NAME[key] || BY_NAME[(dish?.name || '').toLowerCase().trim()]

  if (override && (!raw || looksBoilerplate(raw))) return override
  if (raw && !looksBoilerplate(raw)) return raw
  if (override) return override
  return raw
}
