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

  /**
   * 상품 목록 조회 API
   * @param user user의 type이 포함된 user 정보로, 비회원인 경우 null
   * @param queries ProductQueryDto
   * @returns 조회된 상품 목록
   */
  @Get()
  @UseGuards(OptionalAuthGuard)
  async findAll(
    @UserInfo() user: UserPayload | null,
    @Query() queries: ProductQueryDto,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.findAll(user, queries);
  }
}
