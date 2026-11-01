import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { PaginationWithSearchDto } from '@/common/dto/pagination-with-search.dto';
import { normalizeString } from '@/common/transformers/normalize-string.transformer';

export class FindAllProductsDto extends PaginationWithSearchDto {
  @ApiPropertyOptional({
    example: 'svet',
    description: 'Slug категории',
  })
  @Transform(normalizeString)
  @IsOptional()
  @IsString({ message: 'Slug категории должен быть строкой' })
  categorySlug?: string;

  @ApiPropertyOptional({
    example: 'lyustry',
    description: 'Slug подкатегории. Требует указания categorySlug',
  })
  @Transform(normalizeString)
  @IsOptional()
  @IsString({ message: 'Slug подкатегории должен быть строкой' })
  subcategorySlug?: string;
}
