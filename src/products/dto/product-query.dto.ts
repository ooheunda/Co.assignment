import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class ProductQueryDto {
  @IsOptional()
  @IsString()
  readonly brand?: string;

  @IsOptional()
  @IsNumberString()
  readonly page?: string = '1';

  @IsOptional()
  @IsNumberString()
  readonly pageCount?: string = '10';
}
