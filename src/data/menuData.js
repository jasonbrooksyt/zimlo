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
  { id: 'bakery-items', name: 'Bakery Items', nameHi: 'बेकरी आइटम' }
]

// ---- Dishes (fake catalogue, no hotel/restaurant names shown anywhere) ----
export const DISHES = [
  // Fast Food
  { id: 'd1', subcategory: 'fast-food', name: 'Veg Burger', nameHi: 'वेज बर्गर', price: 79, veg: true, img: '🍔' },
  { id: 'd2', subcategory: 'fast-food', name: 'Cheese Sandwich', nameHi: 'चीज़ सैंडविच', price: 69, veg: true, img: '🥪' },
  { id: 'd3', subcategory: 'fast-food', name: 'French Fries', nameHi: 'फ्रेंच फ्राइज़', price: 89, veg: true, img: '🍟' },
  { id: 'd4', subcategory: 'fast-food', name: 'Chicken Burger', nameHi: 'चिकन बर्गर', price: 109, veg: false, img: '🍔' },

  // North Indian
  { id: 'd5', subcategory: 'north-indian', name: 'Paneer Butter Masala', nameHi: 'पनीर बटर मसाला', price: 149, veg: true, img: '🍛' },
  { id: 'd6', subcategory: 'north-indian', name: 'Dal Makhani', nameHi: 'दाल मखनी', price: 119, veg: true, img: '🍲' },
  { id: 'd7', subcategory: 'north-indian', name: 'Butter Chicken', nameHi: 'बटर चिकन', price: 189, veg: false, img: '🍗' },
  { id: 'd8', subcategory: 'north-indian', name: 'Tandoori Roti (2 pc)', nameHi: 'तंदूरी रोटी (2 पीस)', price: 30, veg: true, img: '🫓' },

  // South Indian
  { id: 'd9', subcategory: 'south-indian', name: 'Masala Dosa', nameHi: 'मसाला डोसा', price: 89, veg: true, img: '🥞' },
  { id: 'd10', subcategory: 'south-indian', name: 'Idli Sambhar (4 pc)', nameHi: 'इडली सांभर (4 पीस)', price: 69, veg: true, img: '🍚' },
  { id: 'd11', subcategory: 'south-indian', name: 'Medu Vada (2 pc)', nameHi: 'मेदू वड़ा (2 पीस)', price: 59, veg: true, img: '🍩' },

  // Chinese
  { id: 'd12', subcategory: 'chinese', name: 'Veg Noodles', nameHi: 'वेज नूडल्स', price: 99, veg: true, img: '🍜' },
  { id: 'd13', subcategory: 'chinese', name: 'Veg Manchurian', nameHi: 'वेज मंचूरियन', price: 109, veg: true, img: '🥘' },
  { id: 'd14', subcategory: 'chinese', name: 'Chicken Fried Rice', nameHi: 'चिकन फ्राइड राइस', price: 139, veg: false, img: '🍛' },

  // Bakery Items (within Food)
  { id: 'd15', subcategory: 'bakery-items', name: 'Chocolate Pastry', nameHi: 'चॉकलेट पेस्ट्री', price: 59, veg: true, img: '🍰' },
  { id: 'd16', subcategory: 'bakery-items', name: 'Bread Pack', nameHi: 'ब्रेड पैक', price: 45, veg: true, img: '🍞' },
  { id: 'd17', subcategory: 'bakery-items', name: 'Cookies (200g)', nameHi: 'कुकीज़ (200g)', price: 79, veg: true, img: '🍪' }
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
