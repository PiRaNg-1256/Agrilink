export type Locale = 'en' | 'hi' | 'kn'

export const translations = {
  en: {
    nav: { shop: 'Shop', dashboard: 'Dashboard', signOut: 'Sign Out', getStarted: 'Get Started' },
    hero: { badge: 'Direct Farm to Consumer', headline1: 'Farm Fresh.', headline2: 'Direct to You.', sub: 'Agrilink connects small-scale farmers directly with consumers — no middlemen, fairer prices, fresher produce.', cta1: 'Shop Fresh Produce', cta2: 'Join as Farmer' },
    howItWorks: { label: 'How It Works', title: 'From field to table,', titleGray: 'simplified.', step1Title: 'Farmers List Produce', step1Desc: 'Small-scale farmers create listings with prices, availability, and delivery options — directly on Agrilink.', step2Title: 'Consumers Browse & Order', step2Desc: 'Buyers discover local farmers, browse fresh produce, and place orders with a single click.', step3Title: 'Direct Delivery or Pickup', step3Desc: 'Farmers deliver to your door or you pick up locally — zero middlemen, maximum freshness.' },
    shop: { title: 'Shop Direct', subtitle: 'from farmers.', searchPlaceholder: 'Search products, farmers...', filters: { all: 'All', delivery: 'Delivery', pickup: 'Pickup' }, categories: { all: 'All', vegetables: 'Vegetables', fruits: 'Fruits', grains: 'Grains', dairy: 'Dairy', other: 'Other' }, priceRange: 'Price Range', noResults: 'No products found.' },
    product: { addToCart: 'Add to Cart', inStock: 'available', deliveryArea: 'Delivery Area', pickupAt: 'Pickup At' },
    cart: { title: 'Your Cart', empty: 'Your cart is empty', browseProducts: 'Browse Products', total: 'Total', checkout: 'Proceed to Checkout' },
    checkout: { title: 'Checkout', deliveryMethod: 'Delivery Method', homeDelivery: 'Home Delivery', farmPickup: 'Farm Pickup', deliveryAddress: 'Delivery Address', paymentDetails: 'Payment Details (Demo)', pay: 'Pay', placing: 'Placing Order...' },
    orders: { title: 'My Orders', noOrders: 'No orders yet.', reorder: 'Reorder', status: { pending: 'Pending', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered' } },
    auth: { signIn: 'Sign In', register: 'Register', email: 'Email', password: 'Password', fullName: 'Full Name', iAmA: 'I am a...', consumer: 'Consumer', farmer: 'Farmer', createAccount: 'Create Account', loading: 'Loading...' },
    footer: { tagline: 'Empowering farmers. Connecting communities. Fresh from the source.', shop: 'Shop', join: 'Join', rights: '© 2026 Agrilink. All rights reserved.' },
    seasonalHighlights: { label: "Season's Best", title: "What's fresh", titleGreen: 'right now.' },
    cropPrices: { label: 'Live Market', title: "Today's Crop Prices", subtitle: 'Live MSP + mandi rates updated every 30 seconds', lastUpdated: 'Last updated' },
  },
  hi: {
    nav: { shop: 'दुकान', dashboard: 'डैशबोर्ड', signOut: 'साइन आउट', getStarted: 'शुरू करें' },
    hero: { badge: 'सीधे खेत से उपभोक्ता तक', headline1: 'खेत से ताज़ा।', headline2: 'सीधे आपके पास।', sub: 'एग्रीलिंक छोटे किसानों को सीधे उपभोक्ताओं से जोड़ता है — कोई बिचौलिया नहीं, उचित मूल्य, ताज़ा उपज।', cta1: 'ताज़ी उपज खरीदें', cta2: 'किसान के रूप में जुड़ें' },
    howItWorks: { label: 'कैसे काम करता है', title: 'खेत से थाली तक,', titleGray: 'सरल बना दिया।', step1Title: 'किसान उपज सूचीबद्ध करते हैं', step1Desc: 'छोटे किसान सीधे एग्रीलिंक पर मूल्य, उपलब्धता और डिलीवरी विकल्पों के साथ लिस्टिंग बनाते हैं।', step2Title: 'उपभोक्ता ब्राउज़ और ऑर्डर करते हैं', step2Desc: 'खरीदार स्थानीय किसानों को खोजते हैं, ताज़ी उपज ब्राउज़ करते हैं, और एक क्लिक में ऑर्डर देते हैं।', step3Title: 'सीधी डिलीवरी या पिकअप', step3Desc: 'किसान आपके दरवाजे तक पहुँचाते हैं या आप स्थानीय रूप से पिकअप करें — कोई बिचौलिया नहीं, अधिकतम ताज़गी।' },
    shop: { title: 'सीधे खरीदें', subtitle: 'किसानों से।', searchPlaceholder: 'उत्पाद, किसान खोजें...', filters: { all: 'सभी', delivery: 'डिलीवरी', pickup: 'पिकअप' }, categories: { all: 'सभी', vegetables: 'सब्जियाँ', fruits: 'फल', grains: 'अनाज', dairy: 'डेयरी', other: 'अन्य' }, priceRange: 'मूल्य सीमा', noResults: 'कोई उत्पाद नहीं मिला।' },
    product: { addToCart: 'कार्ट में जोड़ें', inStock: 'उपलब्ध', deliveryArea: 'डिलीवरी क्षेत्र', pickupAt: 'पिकअप यहाँ' },
    cart: { title: 'आपकी कार्ट', empty: 'आपकी कार्ट खाली है', browseProducts: 'उत्पाद देखें', total: 'कुल', checkout: 'चेकआउट करें' },
    checkout: { title: 'चेकआउट', deliveryMethod: 'डिलीवरी विधि', homeDelivery: 'घर पर डिलीवरी', farmPickup: 'खेत से पिकअप', deliveryAddress: 'डिलीवरी पता', paymentDetails: 'भुगतान विवरण (डेमो)', pay: 'भुगतान करें', placing: 'ऑर्डर दे रहे हैं...' },
    orders: { title: 'मेरे ऑर्डर', noOrders: 'अभी तक कोई ऑर्डर नहीं।', reorder: 'फिर से ऑर्डर करें', status: { pending: 'लंबित', confirmed: 'पुष्टि हुई', shipped: 'भेजा गया', delivered: 'डिलीवर हुआ' } },
    auth: { signIn: 'साइन इन', register: 'पंजीकरण', email: 'ईमेल', password: 'पासवर्ड', fullName: 'पूरा नाम', iAmA: 'मैं हूँ...', consumer: 'उपभोक्ता', farmer: 'किसान', createAccount: 'खाता बनाएँ', loading: 'लोड हो रहा है...' },
    footer: { tagline: 'किसानों को सशक्त करना। समुदायों को जोड़ना। सीधे स्रोत से ताज़ा।', shop: 'दुकान', join: 'जुड़ें', rights: '© 2026 एग्रीलिंक। सर्वाधिकार सुरक्षित।' },
    seasonalHighlights: { label: 'मौसम का सर्वश्रेष्ठ', title: 'अभी क्या ताज़ा है', titleGreen: 'इस मौसम में।' },
    cropPrices: { label: 'लाइव बाज़ार', title: 'आज के फसल मूल्य', subtitle: 'हर 30 सेकंड में अपडेट होने वाली MSP + मंडी दरें', lastUpdated: 'अंतिम अपडेट' },
  },
  kn: {
    nav: { shop: 'ಅಂಗಡಿ', dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', signOut: 'ಸೈನ್ ಔಟ್', getStarted: 'ಪ್ರಾರಂಭಿಸಿ' },
    hero: { badge: 'ನೇರ ಹೊಲದಿಂದ ಗ್ರಾಹಕರಿಗೆ', headline1: 'ಹೊಲದ ತಾಜಾ.', headline2: 'ನೇರ ನಿಮ್ಮ ಕೈಗೆ.', sub: 'ಎಗ್ರಿಲಿಂಕ್ ಸಣ್ಣ ರೈತರನ್ನು ನೇರವಾಗಿ ಗ್ರಾಹಕರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತದೆ — ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲ, ನ್ಯಾಯೋಚಿತ ಬೆಲೆ, ತಾಜಾ ಉತ್ಪನ್ನ.', cta1: 'ತಾಜಾ ಉತ್ಪನ್ನ ಕೊಳ್ಳಿ', cta2: 'ರೈತರಾಗಿ ಸೇರಿ' },
    howItWorks: { label: 'ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ', title: 'ಹೊಲದಿಂದ ಮೇಜಿಗೆ,', titleGray: 'ಸರಳವಾಗಿಸಲಾಗಿದೆ.', step1Title: 'ರೈತರು ಉತ್ಪನ್ನ ಪಟ್ಟಿ ಮಾಡುತ್ತಾರೆ', step1Desc: 'ಸಣ್ಣ ರೈತರು ಬೆಲೆ, ಲಭ್ಯತೆ ಮತ್ತು ವಿತರಣಾ ಆಯ್ಕೆಗಳೊಂದಿಗೆ ನೇರವಾಗಿ ಎಗ್ರಿಲಿಂಕ್‌ನಲ್ಲಿ ಪಟ್ಟಿಗಳನ್ನು ರಚಿಸುತ್ತಾರೆ.', step2Title: 'ಗ್ರಾಹಕರು ಬ್ರೌಸ್ ಮತ್ತು ಆರ್ಡರ್ ಮಾಡುತ್ತಾರೆ', step2Desc: 'ಖರೀದಿದಾರರು ಸ್ಥಳೀಯ ರೈತರನ್ನು ಹುಡುಕುತ್ತಾರೆ, ತಾಜಾ ಉತ್ಪನ್ನ ಬ್ರೌಸ್ ಮಾಡುತ್ತಾರೆ ಮತ್ತು ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಆರ್ಡರ್ ನೀಡುತ್ತಾರೆ.', step3Title: 'ನೇರ ವಿತರಣೆ ಅಥವಾ ಪಿಕಪ್', step3Desc: 'ರೈತರು ನಿಮ್ಮ ಬಾಗಿಲಿಗೆ ತಲುಪಿಸುತ್ತಾರೆ ಅಥವಾ ನೀವು ಸ್ಥಳೀಯವಾಗಿ ಪಿಕಪ್ ಮಾಡಿ — ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲ, ಗರಿಷ್ಠ ತಾಜಾತನ.' },
    shop: { title: 'ನೇರ ಕೊಳ್ಳಿ', subtitle: 'ರೈತರಿಂದ.', searchPlaceholder: 'ಉತ್ಪನ್ನ, ರೈತರ ಹುಡುಕಿ...', filters: { all: 'ಎಲ್ಲ', delivery: 'ವಿತರಣೆ', pickup: 'ಪಿಕಪ್' }, categories: { all: 'ಎಲ್ಲ', vegetables: 'ತರಕಾರಿ', fruits: 'ಹಣ್ಣು', grains: 'ಧಾನ್ಯ', dairy: 'ಡೇರಿ', other: 'ಇತರ' }, priceRange: 'ಬೆಲೆ ಶ್ರೇಣಿ', noResults: 'ಯಾವುದೇ ಉತ್ಪನ್ನ ಕಂಡುಬಂದಿಲ್ಲ.' },
    product: { addToCart: 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ', inStock: 'ಲಭ್ಯ', deliveryArea: 'ವಿತರಣಾ ಪ್ರದೇಶ', pickupAt: 'ಪಿಕಪ್ ಇಲ್ಲಿ' },
    cart: { title: 'ನಿಮ್ಮ ಕಾರ್ಟ್', empty: 'ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ', browseProducts: 'ಉತ್ಪನ್ನ ನೋಡಿ', total: 'ಒಟ್ಟು', checkout: 'ಚೆಕ್‌ಔಟ್ ಮಾಡಿ' },
    checkout: { title: 'ಚೆಕ್‌ಔಟ್', deliveryMethod: 'ವಿತರಣಾ ವಿಧಾನ', homeDelivery: 'ಮನೆ ವಿತರಣೆ', farmPickup: 'ತೋಟದ ಪಿಕಪ್', deliveryAddress: 'ವಿತರಣಾ ವಿಳಾಸ', paymentDetails: 'ಪಾವತಿ ವಿವರಗಳು (ಡೆಮೋ)', pay: 'ಪಾವತಿಸಿ', placing: 'ಆರ್ಡರ್ ನೀಡಲಾಗುತ್ತಿದೆ...' },
    orders: { title: 'ನನ್ನ ಆರ್ಡರ್‌ಗಳು', noOrders: 'ಇನ್ನೂ ಯಾವುದೇ ಆರ್ಡರ್ ಇಲ್ಲ.', reorder: 'ಮತ್ತೆ ಆರ್ಡರ್ ಮಾಡಿ', status: { pending: 'ಬಾಕಿ', confirmed: 'ದೃಢಪಡಿಸಲಾಗಿದೆ', shipped: 'ಕಳುಹಿಸಲಾಗಿದೆ', delivered: 'ವಿತರಿಸಲಾಗಿದೆ' } },
    auth: { signIn: 'ಸೈನ್ ಇನ್', register: 'ನೋಂದಣಿ', email: 'ಇಮೇಲ್', password: 'ಪಾಸ್‌ವರ್ಡ್', fullName: 'ಪೂರ್ಣ ಹೆಸರು', iAmA: 'ನಾನು...', consumer: 'ಗ್ರಾಹಕ', farmer: 'ರೈತ', createAccount: 'ಖಾತೆ ರಚಿಸಿ', loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' },
    footer: { tagline: 'ರೈತರನ್ನು ಸಶಕ್ತಗೊಳಿಸುವುದು. ಸಮುದಾಯಗಳನ್ನು ಸಂಪರ್ಕಿಸುವುದು. ನೇರ ಮೂಲದಿಂದ ತಾಜಾ.', shop: 'ಅಂಗಡಿ', join: 'ಸೇರಿ', rights: '© 2026 ಎಗ್ರಿಲಿಂಕ್. ಎಲ್ಲ ಹಕ್ಕುಗಳು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.' },
    seasonalHighlights: { label: 'ಋತುವಿನ ಅತ್ಯುತ್ತಮ', title: 'ಈಗ ಏನು ತಾಜಾ', titleGreen: 'ಈ ಋತುವಿನಲ್ಲಿ.' },
    cropPrices: { label: 'ಲೈವ್ ಮಾರುಕಟ್ಟೆ', title: 'ಇಂದಿನ ಬೆಳೆ ಬೆಲೆ', subtitle: 'ಪ್ರತಿ 30 ಸೆಕೆಂಡ್‌ಗೆ ನವೀಕರಿಸಲಾಗುತ್ತದೆ MSP + ಮಂಡಿ ದರಗಳು', lastUpdated: 'ಕೊನೆಯ ನವೀಕರಣ' },
  },
}

export type TranslationKey = typeof translations.en
