import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from '../common/entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private readonly productRepository: Repository<Product>) {}

  async findAll() {
    return `This action returns all products`;
  }
}
