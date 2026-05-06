export type UserRole = 'farmer' | 'consumer'

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  phone: string | null
  location: string | null
  avatar_url: string | null
  created_at: string
}

export type ProductCategory = 'vegetables' | 'fruits' | 'grains' | 'dairy' | 'other'
export type DeliveryType = 'both' | 'delivery' | 'pickup'
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered'

export interface Product {
  id: string
  farmer_id: string
  name: string
  description: string | null
  price: number
  unit: string
  stock: number
  category: ProductCategory
  image_url: string | null
  delivery_type: DeliveryType
  delivery_area: string | null
  pickup_location: string | null
  is_available: boolean
  created_at: string
  profiles?: Profile
}

export interface Order {
  id: string
  consumer_id: string
  farmer_id: string
  status: OrderStatus
  delivery_type: 'delivery' | 'pickup'
  address: string | null
  total_price: number
  created_at: string
  order_items?: OrderItem[]
  profiles?: Profile
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  products?: Product
}

export interface CartItem {
  product: Product
  quantity: number
}
