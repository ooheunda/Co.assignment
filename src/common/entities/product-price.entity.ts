import { Column, Entity, ManyToOne } from 'typeorm';

import { UserType } from '../types/user-type.enum';

import { BaseModel } from './base-model.entity';
import { Product } from './product.entity';

@Entity('product_prices')
export class ProductPrice extends BaseModel {
  @Column('int', { nullable: false })
  price: number;

  @Column('enum', { enum: UserType, nullable: false })
  userType: UserType;

  @Column('int', { nullable: false })
  productId: number;

  @ManyToOne(() => Product, (product) => product.productPrices)
  product: Product;
}
