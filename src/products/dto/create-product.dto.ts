import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  Validate,
  ValidateIf,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

import { normalizeString } from '@/common/transformers/normalize-string.transformer';

const MAX_PRICE = 2_147_483_647;

@ValidatorConstraint({ name: 'productPrice' })
class ProductPriceValidator implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return (
      typeof value === 'number' &&
      Number.isFinite(value) &&
      value >= 0 &&
      value <= MAX_PRICE &&
      Number(value.toFixed(2)) === value
    );
  }
}

export class CreateProductDto {
  @ApiPropertyOptional({
    description: 'Скрыть товар в публичном каталоге',
    default: false,
  })
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @IsBoolean({ message: 'Признак скрытия товара должен быть логическим' })
  isHidden?: boolean;

  @ApiProperty({
    example: 'Люстра',
    description: 'Название товара',
    maxLength: 500,
  })
  @Transform(normalizeString)
  @IsDefined({ message: 'Название товара обязательно' })
  @IsString({ message: 'Название товара должно быть строкой' })
  @MinLength(1, { message: 'Название товара не должно быть пустым' })
  @MaxLength(500, {
    message: 'Название товара не должно превышать 500 символов',
  })
  name!: string;

  @ApiProperty({
    example: 'https://example.com/products/1',
    description: 'URL источника',
    maxLength: 2048,
  })
  @Transform(normalizeString)
  @IsDefined({ message: 'URL источника обязателен' })
  @IsString({ message: 'URL источника должен быть строкой' })
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'Некорректный URL источника' },
  )
  @MaxLength(2048, {
    message: 'URL источника не должен превышать 2048 символов',
  })
  sourceUrl!: string;

  @ApiPropertyOptional({
    example: 'Maytoni',
    description: 'Бренд',
    maxLength: 255,
    nullable: true,
  })
  @Transform(normalizeString)
  @IsOptional()
  @IsString({ message: 'Бренд должен быть строкой' })
  @MaxLength(255, { message: 'Бренд не должен превышать 255 символов' })
  brand?: string | null;

  @ApiPropertyOptional({
    example: ['https://example.com/product.jpg'],
    description: 'URL изображений товара',
    type: [String],
  })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsArray({ message: 'Изображения должны быть массивом URL' })
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { each: true, message: 'Некорректный URL изображения' },
  )
  @MaxLength(2048, {
    each: true,
    message: 'URL изображения не должен превышать 2048 символов',
  })
  imageUrls?: string[];

  @ApiPropertyOptional({
    example: 15000.5,
    nullable: true,
    minimum: 0,
    maximum: MAX_PRICE,
  })
  @IsOptional()
  @Validate(ProductPriceValidator, {
    message: 'Цена должна быть от 0 до 2147483647 с точностью до копеек',
  })
  price?: number | null;

  @ApiPropertyOptional({
    example: 18000,
    nullable: true,
    minimum: 0,
    maximum: MAX_PRICE,
  })
  @IsOptional()
  @Validate(ProductPriceValidator, {
    message: 'Старая цена должна быть от 0 до 2147483647 с точностью до копеек',
  })
  oldPrice?: number | null;

  @ApiPropertyOptional({ nullable: true, maxLength: 10000 })
  @Transform(normalizeString)
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  @MaxLength(10000, { message: 'Описание не должно превышать 10000 символов' })
  description?: string | null;

  @ApiProperty({
    example: 1,
    description: 'ID категории',
    minimum: 1,
    maximum: 2147483647,
  })
  @IsDefined({ message: 'ID категории обязателен' })
  @IsInt({ message: 'ID категории должен быть целым числом' })
  @Min(1, { message: 'ID категории должен быть положительным' })
  @Max(2147483647, { message: 'ID категории не должен превышать 2147483647' })
  categoryId!: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID подкатегории в указанной категории',
    nullable: true,
    minimum: 1,
    maximum: 2147483647,
  })
  @IsOptional()
  @IsInt({ message: 'ID подкатегории должен быть целым числом' })
  @Min(1, { message: 'ID подкатегории должен быть положительным' })
  @Max(2147483647, {
    message: 'ID подкатегории не должен превышать 2147483647',
  })
  subcategoryId?: number | null;
}
