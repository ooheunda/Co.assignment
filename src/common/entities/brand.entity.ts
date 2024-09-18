import { Column, Entity, OneToMany } from 'typeorm';

import { BaseModel } from './base-model.entity';
import { Product } from './product.entity';

@Entity('brands')
export class Brand extends BaseModel {
  @Column('varchar', { unique: true, nullable: false })
  email: string;

  @Column('varchar', { select: false, nullable: false })
  password: string;

  @Column('varchar', { nullable: false })
  name: string;

  @Column('text', { nullable: false })
  description: string;

  @OneToMany(() => Product, (product) => product.brand)
  products: Product[];
}
