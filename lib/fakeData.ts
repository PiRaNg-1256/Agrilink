import type { Product, Profile } from './types'

const fakeProfile = (id: string, name: string, location: string): Profile => ({
  id,
  role: 'farmer',
  full_name: name,
  phone: null,
  location,
  avatar_url: null,
  created_at: new Date().toISOString(),
})

export const FAKE_FARMERS: Profile[] = [
  fakeProfile('fake-farmer-1', 'Ravi Kumar', 'Kolar, Karnataka'),
  fakeProfile('fake-farmer-2', 'Meena Devi', 'Mysuru, Karnataka'),
  fakeProfile('fake-farmer-3', 'Venkat Reddy', 'Guntur, Andhra Pradesh'),
  fakeProfile('fake-farmer-4', 'Lakshmi Sundaram', 'Ooty, Tamil Nadu'),
  fakeProfile('fake-farmer-5', 'Prakash Desai', 'Solapur, Maharashtra'),
  fakeProfile('fake-farmer-6', 'Ramesh Sharma', 'Barmer, Rajasthan'),
  fakeProfile('fake-farmer-7', 'Suresh Patil', 'Ratnagiri, Maharashtra'),
  fakeProfile('fake-farmer-8', 'Gopalan Nair', 'Thrissur, Kerala'),
  fakeProfile('fake-farmer-9', 'Arumugam S', 'Thanjavur, Tamil Nadu'),
]

const p = (
  id: string,
  farmerId: string,
  name: string,
  description: string,
  price: number,
  unit: string,
  stock: number,
  category: Product['category'],
  image_url: string,
  delivery_type: Product['delivery_type'],
  delivery_area: string | null,
  pickup_location: string | null,
  farmerProfile: Profile
): Product => ({
  id,
  farmer_id: farmerId,
  name,
  description,
  price,
  unit,
  stock,
  category,
  image_url,
  delivery_type,
  delivery_area,
  pickup_location,
  is_available: true,
  created_at: new Date().toISOString(),
  profiles: farmerProfile,
})

const f1 = FAKE_FARMERS[0]
const f2 = FAKE_FARMERS[1]
const f3 = FAKE_FARMERS[2]
const f4 = FAKE_FARMERS[3]
const f5 = FAKE_FARMERS[4]
const f6 = FAKE_FARMERS[5]
const f7 = FAKE_FARMERS[6]
const f8 = FAKE_FARMERS[7]
const f9 = FAKE_FARMERS[8]

export const FAKE_SHOP_PRODUCTS: Product[] = [
  // VEGETABLES (8)
  p('fake-1', 'fake-farmer-1', 'Fresh Tomatoes', 'Sun-ripened, pesticide-free tomatoes from Karnataka highlands. Perfect for curries and salads.', 35, 'kg', 50, 'vegetables', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop', 'both', 'Bangalore', 'Kolar Farm Gate', f1),
  p('fake-2', 'fake-farmer-2', 'Organic Spinach', 'Harvested fresh every morning. Iron-rich, no chemicals. Perfect for palak paneer.', 25, 'bunch', 30, 'vegetables', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop', 'both', 'Mysuru', 'Devi Farm, Mysuru', f2),
  p('fake-3', 'fake-farmer-3', 'Green Chilies', 'Medium-hot Guntur green chilies. Freshly picked, packed with flavour and vitamin C.', 60, 'kg', 20, 'vegetables', 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400&auto=format&fit=crop', 'both', 'Hyderabad', 'Venkat Farm, Guntur', f3),
  p('fake-4', 'fake-farmer-4', 'Baby Potatoes', 'Small, tender baby potatoes. Great for roasting and curries. Grown in Nilgiris highlands.', 45, 'kg', 40, 'vegetables', 'https://images.unsplash.com/photo-1561635741-c416a5193b6e?w=400&auto=format&fit=crop', 'delivery', 'Chennai, Coimbatore', null, f4),
  p('fake-5', 'fake-farmer-1', 'Purple Brinjal', 'Traditional Karnataka brinjal variety. Perfect for ennegayi and baingan bharta.', 30, 'kg', 25, 'vegetables', 'https://images.unsplash.com/photo-1690487966073-f2ba29a7eb7c?w=400&auto=format&fit=crop', 'both', 'Dharwad', 'Kumar Farm, Dharwad', f1),
  p('fake-6', 'fake-farmer-2', 'Drumstick (Moringa)', 'Fresh moringa pods from organic farm. Packed with nutrients. Sambar ready.', 50, 'kg', 15, 'vegetables', 'https://images.unsplash.com/photo-1490175677764-12ef5f1eaf87?w=400&auto=format&fit=crop', 'pickup', null, 'Devi Farm, Mysuru', f2),
  p('fake-7', 'fake-farmer-6', 'Fresh Garlic', 'Strong, pungent garlic from Rajasthan. Longer shelf life, intense flavour.', 120, 'kg', 30, 'vegetables', 'https://images.unsplash.com/photo-1639119677984-b6c9ed1b0ca8?w=400&auto=format&fit=crop', 'delivery', 'Pan India', null, f6),
  p('fake-8', 'fake-farmer-4', 'Sweet Corn', 'Freshly harvested sweet corn from Nilgiris. Best eaten boiled or roasted the same day.', 15, 'piece', 100, 'vegetables', 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&auto=format&fit=crop', 'pickup', null, 'Nilgiris Farm, Ooty', f4),
  // FRUITS (5)
  p('fake-9', 'fake-farmer-7', 'Alphonso Mangoes', 'GI-tagged Ratnagiri Alphonso. Naturally ripened, zero calcium carbide. Limited season.', 280, 'dozen', 20, 'fruits', 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&auto=format&fit=crop', 'delivery', 'Mumbai, Pune, Bangalore', null, f7),
  p('fake-10', 'fake-farmer-8', 'Bananas (Nendran)', 'Kerala Nendran bananas. Large, starchy, perfect for chips and desserts.', 80, 'dozen', 40, 'fruits', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop', 'both', 'Kochi, Thrissur', 'Nair Farm, Thrissur', f8),
  p('fake-11', 'fake-farmer-5', 'Pomegranate', 'Solapur pomegranates. Deep red arils, naturally sweet, high in antioxidants.', 150, 'kg', 25, 'fruits', 'https://images.unsplash.com/photo-1574709755254-fcd942d09d5a?w=400&auto=format&fit=crop', 'delivery', 'Pune, Mumbai, Hyderabad', null, f5),
  p('fake-12', 'fake-farmer-4', 'Strawberries', 'Mahabaleshwar strawberries. Grown at 1300m altitude. Sweet-tart, freshly picked.', 120, '250g box', 15, 'fruits', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&auto=format&fit=crop', 'delivery', 'Mumbai, Pune', null, f4),
  p('fake-13', 'fake-farmer-6', 'Watermelon', 'Rajasthan watermelons. Extra sweet due to dry climate. 4-6 kg each.', 25, 'kg', 30, 'fruits', 'https://images.unsplash.com/photo-1622208489373-1fe93e2c6720?w=400&auto=format&fit=crop', 'pickup', null, 'Sharma Farm, Barmer', f6),
  // GRAINS (3)
  p('fake-14', 'fake-farmer-9', 'Brown Rice (Sona Masoori)', 'Unpolished Sona Masoori from Cauvery delta. Traditional variety, low GI index.', 95, 'kg', 100, 'grains', 'https://images.unsplash.com/photo-1583068402014-4466b6c9756d?w=400&auto=format&fit=crop', 'both', 'Pan India', 'Arumugam Farm, Thanjavur', f9),
  p('fake-15', 'fake-farmer-6', 'Bajra (Pearl Millet)', 'Rajasthani bajra. Gluten-free, high protein. Freshly harvested this season.', 45, 'kg', 80, 'grains', 'https://images.unsplash.com/photo-1477558716721-e28322f187c6?w=400&auto=format&fit=crop', 'delivery', 'Pan India', null, f6),
  p('fake-16', 'fake-farmer-9', 'Toor Dal (Pigeon Pea)', 'Premium Toor Dal from Andhra. Split pigeon peas, unpolished. Higher protein content.', 130, 'kg', 60, 'grains', 'https://images.unsplash.com/photo-1499252629638-366e94dd7ee1?w=400&auto=format&fit=crop', 'delivery', 'Pan India', null, f9),
  // DAIRY (4)
  p('fake-17', 'fake-farmer-8', 'A2 Gir Cow Milk', 'Pure A2 milk from grass-fed Gir cows. No hormones, no preservatives. Same-day delivery.', 80, 'litre', 20, 'dairy', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop', 'delivery', 'Kochi, Thrissur, Palakkad', null, f8),
  p('fake-18', 'fake-farmer-8', 'Homemade Ghee', 'Traditionally churned ghee from A2 milk. Grainy texture, nutty aroma. No additives.', 950, '500ml jar', 10, 'dairy', 'https://images.unsplash.com/photo-1573812461383-e5f8b759d12e?w=400&auto=format&fit=crop', 'delivery', 'Pan India', null, f8),
  p('fake-19', 'fake-farmer-2', 'Buffalo Curd', 'Thick, creamy set curd from buffalo milk. Made fresh every morning. Great with rice.', 60, 'kg', 15, 'dairy', 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&auto=format&fit=crop', 'delivery', 'Mysuru', null, f2),
  p('fake-20', 'fake-farmer-7', 'Farm Fresh Eggs', 'Free-range country chicken eggs. Deep orange yolk, rich taste. Collected daily.', 90, 'dozen', 40, 'dairy', 'https://images.unsplash.com/photo-1701252776710-d81bfd7a5806?w=400&auto=format&fit=crop', 'both', 'Ratnagiri, Mumbai', 'Patil Farm, Ratnagiri', f7),
  // OTHER (4)
  p('fake-21', 'fake-farmer-2', 'Tulsi Honey', 'Raw, unprocessed honey from Mysuru forest apiaries. Tulsi flower variety. Medicinal quality.', 450, '500g jar', 12, 'other', 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&auto=format&fit=crop', 'delivery', 'Pan India', null, f2),
  p('fake-22', 'fake-farmer-3', 'Cold-Pressed Groundnut Oil', 'Traditional wood-pressed groundnut oil from Guntur. No chemicals, full flavour.', 280, 'litre', 20, 'other', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop', 'delivery', 'Hyderabad, Chennai', null, f3),
  p('fake-23', 'fake-farmer-1', 'Dried Red Chilies', 'Byadagi variety dried chilies from Karnataka. Deep red colour, medium heat, rich flavour.', 200, 'kg', 25, 'other', 'https://images.unsplash.com/photo-1752007085497-e835495e2e25?w=400&auto=format&fit=crop', 'delivery', 'Pan India', null, f1),
  p('fake-24', 'fake-farmer-9', 'Coconut (Fresh)', 'Fresh Kerala coconuts. Tender water coconut and mature coconut both available.', 25, 'piece', 60, 'other', 'https://images.unsplash.com/photo-1551117281-9ebf84f8bec9?w=400&auto=format&fit=crop', 'both', 'Chennai, Coimbatore', 'Arumugam Farm, Thanjavur', f9),
]
