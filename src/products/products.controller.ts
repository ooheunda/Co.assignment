import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { UserInfo } from '../common/decorators/user-info.decorator';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard';
import { UserPayload } from '../common/types/user-payload.type';

import { ProductQueryDto } from './dto/product-query.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  async findAll(
    @UserInfo() user: UserPayload | null,
    @Query() queries: ProductQueryDto,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.findAll(user, queries);
  }
}
