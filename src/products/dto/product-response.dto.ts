import { ProductCategory } from '../../common/types/product-category.enum';

/**
 * 응답에 기본 금액, 할인된 금액, 전체 할인율, 상품 정보, 브랜드 정보 포함
 * 로그인하지 않은 경우, 가격 관련 정보는 응답에 포함되지 않음
 **/
export class ProductResponseDto {
  // 기본 금액
  readonly basePrice?: number;

  // 할인된 금액
  readonly discountedPrice?: number;

  // 전체 할인율
  readonly discountRate?: number;

  // 상품 정보
  readonly name: string;
  readonly description: string;
  readonly category: ProductCategory;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  // 브랜드 정보
  readonly brandName: string;
  readonly brandDescription: string;
}
