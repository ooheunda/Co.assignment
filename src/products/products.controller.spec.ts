import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { UserPayload } from '../common/types/user-payload.type';
import { UserType } from '../common/types/user-type.enum';

import { ProductQueryDto } from './dto/product-query.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let productsController: ProductsController;
  let productsService: jest.Mocked<ProductsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            findAll: jest.fn(),
          },
        },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } }, // guard 의존성
      ],
    }).compile();

    productsController = module.get<ProductsController>(ProductsController);
    productsService = module.get<jest.Mocked<ProductsService>>(ProductsService);
  });

  it('should be defined', () => {
    expect(productsController).toBeDefined();
    expect(productsService).toBeDefined();
  });

  describe('findAll', () => {
    const mockUser = { type: UserType.bronze } as UserPayload;
    const productQueryDto = { brand: 'test', page: '2', pageCount: '15' } as ProductQueryDto;
    const mockProducts = [
      {
        name: 'product name',
        brandName: 'brand name',
        discountPrice: 3000,
      } as Partial<ProductResponseDto> as ProductResponseDto,
    ];

    it('상품 목록 조회 성공', async () => {
      productsService.findAll.mockResolvedValue(mockProducts);
      const result = await productsController.findAll(mockUser, productQueryDto);

      expect(productsService.findAll).toHaveBeenCalledWith(mockUser, productQueryDto);
      expect(result).toEqual(mockProducts);
    });

    it('로그인하지 않은 경우에도 조회 성공', async () => {
      productsService.findAll.mockResolvedValue(mockProducts);
      const result = await productsController.findAll(null, productQueryDto);

      expect(productsService.findAll).toHaveBeenCalledWith(null, productQueryDto);
      expect(result).toEqual(mockProducts);
    });
  });
});
