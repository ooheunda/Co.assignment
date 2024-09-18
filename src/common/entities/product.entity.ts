import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { ProductCategory } from '../types/product-category.enum';

import { BaseModel } from './base-model.entity';
import { Brand } from './brand.entity';
import { ProductPrice } from './product-price.entity';

@Entity('products')
export class Product extends BaseModel {
  @Column('varchar', { nullable: false })
  name: string;

  @Column('text', { nullable: false })
  description: string;

  @Column('int', { nullable: false })
  basePrice: number;

  @Column('float', { nullable: false })
  discountRate: number;

  @Column('enum', { enum: ProductCategory, nullable: false })
  category: ProductCategory;

  @Column('int', { nullable: false })
  brandId: number;

  @ManyToOne(() => Brand, (brand) => brand.products)
  brand: Brand;

  @OneToMany(() => ProductPrice, (productPrice) => productPrice.product)
  productPrices: ProductPrice[];
}
