import { Product } from './product.interface';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}
