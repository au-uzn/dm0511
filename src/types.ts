export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'cancelled';

export interface Product {
  id: string;
  name: string;
  englishName: string;
  category: string;
  price: number;
  description?: string;
  tags?: string[];
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: 'M' | 'L';
  sweetness: string;
  ice: string;
  toppings: string[];
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: any; // Firestore Timestamp
  customerName: string;
}

export interface Config {
  adminPasswordHash: string;
  isSetup: boolean;
}
