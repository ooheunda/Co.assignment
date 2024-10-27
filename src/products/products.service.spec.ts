import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Brand } from '../common/entities/brand.entity';
import { ProductPrice } from '../common/entities/product-price.entity';
import { Product } from '../common/entities/product.entity';
import { ProductCategory } from '../common/types/product-category.enum';
import { UserPayload } from '../common/types/user-payload.type';
import { UserType } from '../common/types/user-type.enum';

import { ProductQueryDto } from './dto/product-query.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let productsService: ProductsService;
  let productsRepository: jest.Mocked<Repository<Product>>;

  const mockRawProducts = [
    {
      name: 'name',
      description: 'description',
      basePrice: 10000,
      discountRate: 0.1,
      category: ProductCategory.가방,
      brand: {
        name: 'brandName',
        description: 'brandDescription',
      } as Brand,
      productPrices: [
        {
          discountRate: 0.1,
          userType: UserType.bronze,
        },
      ] as ProductPrice[],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as Product,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue(mockRawProducts),
            } as Partial<SelectQueryBuilder<Product>>),
          },
        },
      ],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);
    productsRepository = module.get<jest.Mocked<Repository<Product>>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Mock 복구
  });

  it('should be defined', () => {
    expect(productsService).toBeDefined();
    expect(productsRepository).toBeDefined();
  });

  describe('findAll', () => {
    const mockUser = { type: UserType.bronze } as UserPayload;
    const productQueryDto = { brand: 'test', page: '2', pageCount: '15' } as ProductQueryDto;
    const mockProducts = [
      {
        name: mockRawProducts[0].name,
        description: mockRawProducts[0].description,
        category: mockRawProducts[0].category,
        brandName: mockRawProducts[0].brand.name,
        brandDescription: mockRawProducts[0].brand.description,
        createdAt: mockRawProducts[0].createdAt,
        updatedAt: mockRawProducts[0].updatedAt,
      } as ProductResponseDto,
    ];

    it('쿼리 빌더 호출 확인', async () => {
      await productsService.findAll(mockUser, productQueryDto);

      expect(productsRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(productsRepository.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalledTimes(2);
      expect(productsRepository.createQueryBuilder().where).toHaveBeenCalledTimes(1);
      expect(productsRepository.createQueryBuilder().orderBy).toHaveBeenCalledWith('p.createdAt', 'DESC');
      expect(productsRepository.createQueryBuilder().skip).toHaveBeenCalledWith(
        (+productQueryDto.page - 1) * +productQueryDto.pageCount,
      );
    });

    it('로그인 하지 않은 경우 상품 목록 조회 성공', async () => {
      const result = await productsService.findAll(null, productQueryDto);

      expect(result).toEqual(mockProducts);
    });

    it('로그인 한 경우 가격 정보 포함하여 조회', async () => {
      const mockProductsWithPriceInfo = [
        {
          ...mockProducts[0],
          basePrice: mockRawProducts[0].basePrice,
          discountedPrice: 8000,
          discountRate: 0.2,
        } as ProductResponseDto,
      ];

      const result = await productsService.findAll(mockUser, productQueryDto);

      expect(result).toEqual(mockProductsWithPriceInfo);
    });

    it('유저 타입에 맞는 가격 정보 없는 경우 기본 할인율로 조회', async () => {
      const mockProductsWithPriceInfo = [
        {
          ...mockProducts[0],
          basePrice: mockRawProducts[0].basePrice,
          discountedPrice: 9000,
          discountRate: 0.1,
        } as ProductResponseDto,
      ];
      const mockUserNotMatchType = { type: UserType.silver } as UserPayload;

      const result = await productsService.findAll(mockUserNotMatchType, productQueryDto);
      expect(result).toEqual(mockProductsWithPriceInfo);
    });

    it('월요일인 경우 할인율 1% 증가', async () => {
      const mockProductsWithPriceInfo = [
        {
          ...mockProducts[0],
          basePrice: mockRawProducts[0].basePrice,
          discountedPrice: 7900,
          discountRate: 0.21,
        } as ProductResponseDto,
      ];
      const monday = new Date('2024-10-28');
      jest.spyOn(global, 'Date').mockImplementation(() => monday);

      const result = await productsService.findAll(mockUser, productQueryDto);
      expect(result).toEqual(mockProductsWithPriceInfo);
    });
  });
});
