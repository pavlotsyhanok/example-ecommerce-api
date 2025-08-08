import { BaseEntity } from '../../../common/entities/base.entity';

export class Product extends BaseEntity {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
  isActive: boolean;

  constructor(partial: Partial<Product> = {}) {
    super();
    Object.assign(this, partial);
    this.isActive = partial.isActive ?? true;
    this.stock = partial.stock ?? 0;
  }
}