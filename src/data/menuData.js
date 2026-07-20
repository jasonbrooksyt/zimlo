// Zimlo — fake/demo data layer.
// In production, replace these exports with API calls (e.g. /api/dishes,
// /api/categories). Keeping the shape identical means swapping the data
// source later won't require touching any component.

// ---- Home screen categories ----
// `type: 'menu'` -> customer browses priced dishes (Food)
// `type: 'request'` -> customer submits a free-text requirement, admin prices it later
export const CATEGORIES = [
  { id: 'food', name: 'Food', nameHi: 'खाना', icon: 'UtensilsCrossed', type: 'menu', color: '#FF9800' },
  { id: 'bakery', name: 'Bakery', nameHi: 'बेकरी', icon: 'Croissant', type: 'request', color: '#FFC107' },
  { id: 'grocery', name: 'Grocery', nameHi: 'किराना', icon: 'ShoppingBasket', type: 'request', color: '#4CAF50' },
  { id: 'medicine', name: 'Medicine', nameHi: 'दवाई', icon: 'Pill', type: 'request', color: '#03A9F4' },
  { id: 'parcel', name: 'Parcel', nameHi: 'पार्सल', icon: 'Package', type: 'request', color: '#9C27B0' },
  { id: 'custom', name: 'Custom Order', nameHi: 'कस्टम ऑर्डर', icon: 'Sparkles', type: 'request', color: '#FF5252' }
]

// ---- Food subcategories ----
// Per the brief: Food shows ONLY dishes with prices, never restaurant/hotel names.
export const FOOD_SUBCATEGORIES = [
  { id: 'fast-food', name: 'Fast Food', nameHi: 'फास्ट फूड' },
  { id: 'north-indian', name: 'North Indian', nameHi: 'उत्तर भारतीय' },
  { id: 'south-indian', name: 'South Indian', nameHi: 'दक्षिण भारतीय' },
  { id: 'chinese', name: 'Chinese', nameHi: 'चाइनीज़' },
  { id: 'bakery-items', name: 'Bakery Items', nameHi: 'बेकरी आइटम' },
  { id: 'beverages', name: 'Beverages', nameHi: 'पेय पदार्थ' },
  { id: 'pizza', name: 'Pizza', nameHi: 'पिज़्ज़ा' },
  { id: 'rolls-wraps', name: 'Rolls & Wraps', nameHi: 'रोल्स और रैप्स' },
  { id: 'thali', name: 'Thali & Combos', nameHi: 'थाली और कॉम्बो' },
  { id: 'street-food', name: 'Street Food', nameHi: 'स्ट्रीट फूड' },
  { id: 'desserts', name: 'Desserts & Sweets', nameHi: 'मिठाई' }
]

// ---- Dishes (fake catalogue, no hotel/restaurant names shown anywhere) ----
export const DISHES = [
  // ===== Fast Food =====
  { id: 'ff1', subcategory: 'fast-food', name: 'Veg Burger', nameHi: 'वेज बर्गर', price: 79, veg: true, img: '🍔' },
  { id: 'ff2', subcategory: 'fast-food', name: 'Cheese Sandwich', nameHi: 'चीज़ सैंडविच', price: 69, veg: true, img: '🥪' },
  { id: 'ff3', subcategory: 'fast-food', name: 'French Fries', nameHi: 'फ्रेंच फ्राइज़', price: 89, veg: true, img: '🍟' },
  { id: 'ff4', subcategory: 'fast-food', name: 'Chicken Burger', nameHi: 'चिकन बर्गर', price: 109, veg: false, img: '🍔' },
  { id: 'ff5', subcategory: 'fast-food', name: 'Veg Cheese Burst Burger', nameHi: 'वेज चीज़ बर्स्ट बर्गर', price: 99, veg: true, img: '🍔' },
  { id: 'ff6', subcategory: 'fast-food', name: 'Peri Peri Fries', nameHi: 'पेरी पेरी फ्राइज़', price: 99, veg: true, img: '🍟' },
  { id: 'ff7', subcategory: 'fast-food', name: 'Chicken Nuggets (6 pc)', nameHi: 'चिकन नगेट्स (6 पीस)', price: 129, veg: false, img: '🍗' },
  { id: 'ff8', subcategory: 'fast-food', name: 'Grilled Sandwich', nameHi: 'ग्रिल्ड सैंडविच', price: 79, veg: true, img: '🥪' },
  { id: 'ff9', subcategory: 'fast-food', name: 'Corn Cheese Nuggets', nameHi: 'कॉर्न चीज़ नगेट्स', price: 89, veg: true, img: '🧀' },
  { id: 'ff10', subcategory: 'fast-food', name: 'Chicken Popcorn', nameHi: 'चिकन पॉपकॉर्न', price: 119, veg: false, img: '🍗' },
  { id: 'ff11', subcategory: 'fast-food', name: 'Aloo Tikki Burger', nameHi: 'आलू टिक्की बर्गर', price: 59, veg: true, img: '🍔' },
  { id: 'ff12', subcategory: 'fast-food', name: 'Veg Hot Dog', nameHi: 'वेज हॉट डॉग', price: 89, veg: true, img: '🌭' },
  { id: 'ff13', subcategory: 'fast-food', name: 'Club Sandwich', nameHi: 'क्लब सैंडविच', price: 99, veg: true, img: '🥪' },
  { id: 'ff14', subcategory: 'fast-food', name: 'Cheese Corn Balls (6 pc)', nameHi: 'चीज़ कॉर्न बॉल्स (6 पीस)', price: 109, veg: true, img: '🧀' },
  { id: 'ff15', subcategory: 'fast-food', name: 'Chicken Wings (6 pc)', nameHi: 'चिकन विंग्स (6 पीस)', price: 149, veg: false, img: '🍗' },
  { id: 'ff16', subcategory: 'fast-food', name: 'Veg Momos (8 pc)', nameHi: 'वेज मोमोज़ (8 पीस)', price: 79, veg: true, img: '🥟' },
  { id: 'ff17', subcategory: 'fast-food', name: 'Chicken Momos (8 pc)', nameHi: 'चिकन मोमोज़ (8 पीस)', price: 109, veg: false, img: '🥟' },

  // ===== North Indian =====
  { id: 'ni1', subcategory: 'north-indian', name: 'Paneer Butter Masala', nameHi: 'पनीर बटर मसाला', price: 149, veg: true, img: '🍛' },
  { id: 'ni2', subcategory: 'north-indian', name: 'Dal Makhani', nameHi: 'दाल मखनी', price: 119, veg: true, img: '🍲' },
  { id: 'ni3', subcategory: 'north-indian', name: 'Butter Chicken', nameHi: 'बटर चिकन', price: 189, veg: false, img: '🍗' },
  { id: 'ni4', subcategory: 'north-indian', name: 'Tandoori Roti (2 pc)', nameHi: 'तंदूरी रोटी (2 पीस)', price: 30, veg: true, img: '🫓' },
  { id: 'ni5', subcategory: 'north-indian', name: 'Kadai Paneer', nameHi: 'कड़ाही पनीर', price: 159, veg: true, img: '🍛' },
  { id: 'ni6', subcategory: 'north-indian', name: 'Chole Bhature', nameHi: 'छोले भटूरे', price: 99, veg: true, img: '🍛' },
  { id: 'ni7', subcategory: 'north-indian', name: 'Rajma Chawal', nameHi: 'राजमा चावल', price: 109, veg: true, img: '🍚' },
  { id: 'ni8', subcategory: 'north-indian', name: 'Chicken Curry', nameHi: 'चिकन करी', price: 179, veg: false, img: '🍛' },
  { id: 'ni9', subcategory: 'north-indian', name: 'Mutton Curry', nameHi: 'मटन करी', price: 249, veg: false, img: '🍛' },
  { id: 'ni10', subcategory: 'north-indian', name: 'Palak Paneer', nameHi: 'पालक पनीर', price: 139, veg: true, img: '🍲' },
  { id: 'ni11', subcategory: 'north-indian', name: 'Shahi Paneer', nameHi: 'शाही पनीर', price: 159, veg: true, img: '🍛' },
  { id: 'ni12', subcategory: 'north-indian', name: 'Dal Tadka', nameHi: 'दाल तड़का', price: 99, veg: true, img: '🍲' },
  { id: 'ni13', subcategory: 'north-indian', name: 'Jeera Rice', nameHi: 'जीरा राइस', price: 89, veg: true, img: '🍚' },
  { id: 'ni14', subcategory: 'north-indian', name: 'Butter Naan (2 pc)', nameHi: 'बटर नान (2 पीस)', price: 50, veg: true, img: '🫓' },
  { id: 'ni15', subcategory: 'north-indian', name: 'Tandoori Chicken (Half)', nameHi: 'तंदूरी चिकन (हाफ)', price: 199, veg: false, img: '🍗' },
  { id: 'ni16', subcategory: 'north-indian', name: 'Malai Kofta', nameHi: 'मलाई कोफ्ता', price: 149, veg: true, img: '🍛' },
  { id: 'ni17', subcategory: 'north-indian', name: 'Mix Veg', nameHi: 'मिक्स वेज', price: 119, veg: true, img: '🍛' },
  { id: 'ni18', subcategory: 'north-indian', name: 'Egg Curry', nameHi: 'एग करी', price: 109, veg: false, img: '🍛' },

  // ===== South Indian =====
  { id: 'si1', subcategory: 'south-indian', name: 'Masala Dosa', nameHi: 'मसाला डोसा', price: 89, veg: true, img: '🥞' },
  { id: 'si2', subcategory: 'south-indian', name: 'Idli Sambhar (4 pc)', nameHi: 'इडली सांभर (4 पीस)', price: 69, veg: true, img: '🍚' },
  { id: 'si3', subcategory: 'south-indian', name: 'Medu Vada (2 pc)', nameHi: 'मेदू वड़ा (2 पीस)', price: 59, veg: true, img: '🍩' },
  { id: 'si4', subcategory: 'south-indian', name: 'Plain Dosa', nameHi: 'प्लेन डोसा', price: 69, veg: true, img: '🥞' },
  { id: 'si5', subcategory: 'south-indian', name: 'Onion Rava Dosa', nameHi: 'प्याज़ रवा डोसा', price: 99, veg: true, img: '🥞' },
  { id: 'si6', subcategory: 'south-indian', name: 'Uttapam', nameHi: 'उत्तपम', price: 89, veg: true, img: '🥞' },
  { id: 'si7', subcategory: 'south-indian', name: 'Rava Idli (4 pc)', nameHi: 'रवा इडली (4 पीस)', price: 79, veg: true, img: '🍚' },
  { id: 'si8', subcategory: 'south-indian', name: 'Curd Rice', nameHi: 'दही चावल', price: 79, veg: true, img: '🍚' },
  { id: 'si9', subcategory: 'south-indian', name: 'Lemon Rice', nameHi: 'नींबू चावल', price: 79, veg: true, img: '🍚' },
  { id: 'si10', subcategory: 'south-indian', name: 'Mysore Masala Dosa', nameHi: 'मैसूर मसाला डोसा', price: 99, veg: true, img: '🥞' },
  { id: 'si11', subcategory: 'south-indian', name: 'Sambhar Vada (2 pc)', nameHi: 'सांभर वड़ा (2 पीस)', price: 69, veg: true, img: '🍩' },
  { id: 'si12', subcategory: 'south-indian', name: 'Filter Coffee', nameHi: 'फिल्टर कॉफी', price: 39, veg: true, img: '☕' },

  // ===== Chinese =====
  { id: 'ch1', subcategory: 'chinese', name: 'Veg Noodles', nameHi: 'वेज नूडल्स', price: 99, veg: true, img: '🍜' },
  { id: 'ch2', subcategory: 'chinese', name: 'Veg Manchurian', nameHi: 'वेज मंचूरियन', price: 109, veg: true, img: '🥘' },
  { id: 'ch3', subcategory: 'chinese', name: 'Chicken Fried Rice', nameHi: 'चिकन फ्राइड राइस', price: 139, veg: false, img: '🍛' },
  { id: 'ch4', subcategory: 'chinese', name: 'Veg Fried Rice', nameHi: 'वेज फ्राइड राइस', price: 99, veg: true, img: '🍛' },
  { id: 'ch5', subcategory: 'chinese', name: 'Chicken Noodles', nameHi: 'चिकन नूडल्स', price: 129, veg: false, img: '🍜' },
  { id: 'ch6', subcategory: 'chinese', name: 'Chilli Paneer', nameHi: 'चिल्ली पनीर', price: 139, veg: true, img: '🥘' },
  { id: 'ch7', subcategory: 'chinese', name: 'Chilli Chicken', nameHi: 'चिल्ली चिकन', price: 159, veg: false, img: '🍗' },
  { id: 'ch8', subcategory: 'chinese', name: 'Schezwan Noodles', nameHi: 'सेज़वान नूडल्स', price: 119, veg: true, img: '🍜' },
  { id: 'ch9', subcategory: 'chinese', name: 'Spring Rolls (4 pc)', nameHi: 'स्प्रिंग रोल्स (4 पीस)', price: 99, veg: true, img: '🥢' },
  { id: 'ch10', subcategory: 'chinese', name: 'Manchow Soup', nameHi: 'मंचाउ सूप', price: 79, veg: true, img: '🥣' },
  { id: 'ch11', subcategory: 'chinese', name: 'Hot & Sour Soup', nameHi: 'हॉट एंड सोर सूप', price: 79, veg: true, img: '🥣' },
  { id: 'ch12', subcategory: 'chinese', name: 'Chicken Manchurian', nameHi: 'चिकन मंचूरियन', price: 149, veg: false, img: '🥘' },
  { id: 'ch13', subcategory: 'chinese', name: 'American Chopsuey', nameHi: 'अमेरिकन चॉपसुई', price: 129, veg: true, img: '🍜' },

  // ===== Bakery Items (within Food) =====
  { id: 'bk1', subcategory: 'bakery-items', name: 'Chocolate Pastry', nameHi: 'चॉकलेट पेस्ट्री', price: 59, veg: true, img: '🍰' },
  { id: 'bk2', subcategory: 'bakery-items', name: 'Bread Pack', nameHi: 'ब्रेड पैक', price: 45, veg: true, img: '🍞' },
  { id: 'bk3', subcategory: 'bakery-items', name: 'Cookies (200g)', nameHi: 'कुकीज़ (200g)', price: 79, veg: true, img: '🍪' },
  { id: 'bk4', subcategory: 'bakery-items', name: 'Black Forest Slice', nameHi: 'ब्लैक फॉरेस्ट स्लाइस', price: 69, veg: true, img: '🍰' },
  { id: 'bk5', subcategory: 'bakery-items', name: 'Red Velvet Cupcake', nameHi: 'रेड वेलवेट कपकेक', price: 55, veg: true, img: '🧁' },
  { id: 'bk6', subcategory: 'bakery-items', name: 'Veg Puff', nameHi: 'वेज पफ', price: 25, veg: true, img: '🥐' },
  { id: 'bk7', subcategory: 'bakery-items', name: 'Bun Butter', nameHi: 'बन बटर', price: 30, veg: true, img: '🍞' },
  { id: 'bk8', subcategory: 'bakery-items', name: 'Donut', nameHi: 'डोनट', price: 45, veg: true, img: '🍩' },
  { id: 'bk9', subcategory: 'bakery-items', name: 'Croissant', nameHi: 'क्रॉइसां', price: 65, veg: true, img: '🥐' },
  { id: 'bk10', subcategory: 'bakery-items', name: 'Brownie', nameHi: 'ब्राउनी', price: 59, veg: true, img: '🍫' },

  // ===== Beverages =====
  { id: 'bv1', subcategory: 'beverages', name: 'Masala Chai', nameHi: 'मसाला चाय', price: 20, veg: true, img: '☕' },
  { id: 'bv2', subcategory: 'beverages', name: 'Cold Coffee', nameHi: 'कोल्ड कॉफी', price: 69, veg: true, img: '🥤' },
  { id: 'bv3', subcategory: 'beverages', name: 'Fresh Lime Soda', nameHi: 'फ्रेश लाइम सोडा', price: 49, veg: true, img: '🥤' },
  { id: 'bv4', subcategory: 'beverages', name: 'Mango Lassi', nameHi: 'मैंगो लस्सी', price: 59, veg: true, img: '🥤' },
  { id: 'bv5', subcategory: 'beverages', name: 'Sweet Lassi', nameHi: 'मीठी लस्सी', price: 49, veg: true, img: '🥤' },
  { id: 'bv6', subcategory: 'beverages', name: 'Oreo Shake', nameHi: 'ओरियो शेक', price: 89, veg: true, img: '🥤' },
  { id: 'bv7', subcategory: 'beverages', name: 'Chocolate Shake', nameHi: 'चॉकलेट शेक', price: 89, veg: true, img: '🥤' },
  { id: 'bv8', subcategory: 'beverages', name: 'Fresh Orange Juice', nameHi: 'फ्रेश ऑरेंज जूस', price: 69, veg: true, img: '🧃' },
  { id: 'bv9', subcategory: 'beverages', name: 'Buttermilk (Chaas)', nameHi: 'छाछ', price: 25, veg: true, img: '🥛' },
  { id: 'bv10', subcategory: 'beverages', name: 'Iced Tea', nameHi: 'आइस्ड टी', price: 59, veg: true, img: '🧋' },

  // ===== Pizza =====
  { id: 'pz1', subcategory: 'pizza', name: 'Margherita Pizza (Regular)', nameHi: 'मार्गेरिटा पिज़्ज़ा (रेगुलर)', price: 129, veg: true, img: '🍕' },
  { id: 'pz2', subcategory: 'pizza', name: 'Farmhouse Pizza (Regular)', nameHi: 'फार्महाउस पिज़्ज़ा (रेगुलर)', price: 179, veg: true, img: '🍕' },
  { id: 'pz3', subcategory: 'pizza', name: 'Paneer Tikka Pizza (Regular)', nameHi: 'पनीर टिक्का पिज़्ज़ा (रेगुलर)', price: 199, veg: true, img: '🍕' },
  { id: 'pz4', subcategory: 'pizza', name: 'Chicken Tikka Pizza (Regular)', nameHi: 'चिकन टिक्का पिज़्ज़ा (रेगुलर)', price: 229, veg: false, img: '🍕' },
  { id: 'pz5', subcategory: 'pizza', name: 'Cheese Burst Pizza (Regular)', nameHi: 'चीज़ बर्स्ट पिज़्ज़ा (रेगुलर)', price: 219, veg: true, img: '🍕' },
  { id: 'pz6', subcategory: 'pizza', name: 'Pepperoni Pizza (Regular)', nameHi: 'पेपेरोनी पिज़्ज़ा (रेगुलर)', price: 239, veg: false, img: '🍕' },
  { id: 'pz7', subcategory: 'pizza', name: 'Garlic Bread (4 pc)', nameHi: 'गार्लिक ब्रेड (4 पीस)', price: 89, veg: true, img: '🍞' },

  // ===== Rolls & Wraps =====
  { id: 'rw1', subcategory: 'rolls-wraps', name: 'Veg Roll', nameHi: 'वेज रोल', price: 59, veg: true, img: '🌯' },
  { id: 'rw2', subcategory: 'rolls-wraps', name: 'Paneer Roll', nameHi: 'पनीर रोल', price: 79, veg: true, img: '🌯' },
  { id: 'rw3', subcategory: 'rolls-wraps', name: 'Chicken Roll', nameHi: 'चिकन रोल', price: 99, veg: false, img: '🌯' },
  { id: 'rw4', subcategory: 'rolls-wraps', name: 'Egg Roll', nameHi: 'एग रोल', price: 69, veg: false, img: '🌯' },
  { id: 'rw5', subcategory: 'rolls-wraps', name: 'Mutton Seekh Roll', nameHi: 'मटन सीक रोल', price: 129, veg: false, img: '🌯' },
  { id: 'rw6', subcategory: 'rolls-wraps', name: 'Double Egg Chicken Roll', nameHi: 'डबल एग चिकन रोल', price: 119, veg: false, img: '🌯' },
  { id: 'rw7', subcategory: 'rolls-wraps', name: 'Schezwan Paneer Wrap', nameHi: 'सेज़वान पनीर रैप', price: 89, veg: true, img: '🌯' },

  // ===== Thali & Combos =====
  { id: 'th1', subcategory: 'thali', name: 'Veg Thali', nameHi: 'वेज थाली', price: 149, veg: true, img: '🍱' },
  { id: 'th2', subcategory: 'thali', name: 'Deluxe Veg Thali', nameHi: 'डीलक्स वेज थाली', price: 199, veg: true, img: '🍱' },
  { id: 'th3', subcategory: 'thali', name: 'Non-Veg Thali', nameHi: 'नॉन-वेज थाली', price: 229, veg: false, img: '🍱' },
  { id: 'th4', subcategory: 'thali', name: 'South Indian Combo', nameHi: 'साउथ इंडियन कॉम्बो', price: 139, veg: true, img: '🍱' },
  { id: 'th5', subcategory: 'thali', name: 'Burger + Fries Combo', nameHi: 'बर्गर + फ्राइज़ कॉम्बो', price: 149, veg: true, img: '🍱' },
  { id: 'th6', subcategory: 'thali', name: 'Chinese Combo (Noodles + Manchurian)', nameHi: 'चाइनीज़ कॉम्बो (नूडल्स + मंचूरियन)', price: 179, veg: true, img: '🍱' },

  // ===== Street Food =====
  { id: 'sf1', subcategory: 'street-food', name: 'Pani Puri (6 pc)', nameHi: 'पानी पूरी (6 पीस)', price: 39, veg: true, img: '🥟' },
  { id: 'sf2', subcategory: 'street-food', name: 'Bhel Puri', nameHi: 'भेल पूरी', price: 49, veg: true, img: '🥗' },
  { id: 'sf3', subcategory: 'street-food', name: 'Samosa (2 pc)', nameHi: 'समोसा (2 पीस)', price: 30, veg: true, img: '🥟' },
  { id: 'sf4', subcategory: 'street-food', name: 'Vada Pav (2 pc)', nameHi: 'वड़ा पाव (2 पीस)', price: 40, veg: true, img: '🍔' },
  { id: 'sf5', subcategory: 'street-food', name: 'Pav Bhaji', nameHi: 'पाव भाजी', price: 89, veg: true, img: '🍛' },
  { id: 'sf6', subcategory: 'street-food', name: 'Dahi Puri', nameHi: 'दही पूरी', price: 49, veg: true, img: '🥗' },
  { id: 'sf7', subcategory: 'street-food', name: 'Aloo Chaat', nameHi: 'आलू चाट', price: 49, veg: true, img: '🥗' },
  { id: 'sf8', subcategory: 'street-food', name: 'Kachori (2 pc)', nameHi: 'कचौड़ी (2 पीस)', price: 35, veg: true, img: '🥟' },
  { id: 'sf9', subcategory: 'street-food', name: 'Sev Puri', nameHi: 'सेव पूरी', price: 49, veg: true, img: '🥗' },

  // ===== Desserts & Sweets =====
  { id: 'ds1', subcategory: 'desserts', name: 'Gulab Jamun (4 pc)', nameHi: 'गुलाब जामुन (4 पीस)', price: 59, veg: true, img: '🍡' },
  { id: 'ds2', subcategory: 'desserts', name: 'Rasgulla (4 pc)', nameHi: 'रसगुल्ला (4 पीस)', price: 59, veg: true, img: '🍡' },
  { id: 'ds3', subcategory: 'desserts', name: 'Ice Cream Cup', nameHi: 'आइसक्रीम कप', price: 49, veg: true, img: '🍨' },
  { id: 'ds4', subcategory: 'desserts', name: 'Kaju Katli (250g)', nameHi: 'काजू कतली (250g)', price: 199, veg: true, img: '🍬' },
  { id: 'ds5', subcategory: 'desserts', name: 'Jalebi (250g)', nameHi: 'जलेबी (250g)', price: 79, veg: true, img: '🍥' },
  { id: 'ds6', subcategory: 'desserts', name: 'Rasmalai (2 pc)', nameHi: 'रसमलाई (2 पीस)', price: 69, veg: true, img: '🍡' },
  { id: 'ds7', subcategory: 'desserts', name: 'Gajar Halwa', nameHi: 'गाजर हलवा', price: 79, veg: true, img: '🍮' },
  { id: 'ds8', subcategory: 'desserts', name: 'Chocolate Brownie with Ice Cream', nameHi: 'चॉकलेट ब्राउनी विद आइसक्रीम', price: 99, veg: true, img: '🍫' }
]

// Convenience Fee applied to Cash on Delivery orders (₹)
export const COD_FEE = 20

// Delivery fee shown on checkout (flat, demo value)
export const DELIVERY_FEE = 15

// Dummy order tracking stages, used by every order type
export const ORDER_STAGES = [
  { id: 'placed', label: 'Order Placed', labelHi: 'ऑर्डर प्लेस हुआ' },
  { id: 'confirmed', label: 'Confirmed by Zimlo', labelHi: 'ज़िमलो द्वारा पुष्टि' },
  { id: 'preparing', label: 'Preparing / Packing', labelHi: 'तैयार हो रहा है' },
  { id: 'out-for-delivery', label: 'Out for Delivery', labelHi: 'डिलीवरी के लिए निकला' },
  { id: 'delivered', label: 'Delivered', labelHi: 'डिलीवर हो गया' }
]
