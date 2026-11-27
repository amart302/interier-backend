import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

import { normalizeNumber } from '../transformers/normalize-number.transformer';

const MAX_PAGE = 21_474_837;

export class PaginationDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Номер страницы',
    minimum: 1,
    maximum: MAX_PAGE,
  })
  @Transform(normalizeNumber)
  @IsOptional()
  @IsInt({ message: 'Номер страницы должен быть целым числом' })
  @Min(1, { message: 'Номер страницы должен быть не меньше 1' })
  @Max(MAX_PAGE, { message: `Номер страницы не должен превышать ${MAX_PAGE}` })
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Количество записей на странице',
    minimum: 1,
    maximum: 100,
  })
  @Transform(normalizeNumber)
  @IsOptional()
  @IsInt({ message: 'Количество записей должно быть целым числом' })
  @Min(1, { message: 'Количество записей должно быть не меньше 1' })
  @Max(100, {
    message: 'Количество записей не должно превышать 100',
  })
  limit?: number;
}
