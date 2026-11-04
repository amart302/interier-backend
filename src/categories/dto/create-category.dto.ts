import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDefined,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { normalizeString } from '@/common/transformers/normalize-string.transformer';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Люстры',
    description: 'Название категории',
    maxLength: 255,
  })
  @Transform(normalizeString)
  @IsDefined({ message: 'Название категории обязательно' })
  @IsString({ message: 'Название категории должно быть строкой' })
  @MinLength(1, { message: 'Название категории не должно быть пустым' })
  @MaxLength(255, {
    message: 'Название категории не должно превышать 255 символов',
  })
  name!: string;

  @ApiProperty({
    example: 'lyustry',
    description: 'Slug категории: строчные латинские буквы, цифры и дефисы',
  })
  @Transform(normalizeString)
  @IsDefined({ message: 'Slug категории обязателен' })
  @IsString({ message: 'Slug категории должен быть строкой' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug категории должен содержать строчные латинские буквы или цифры, разделенные дефисами',
  })
  slug!: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/lyustry.jpg',
    description: 'URL изображения категории',
    maxLength: 2048,
    nullable: true,
  })
  @Transform(normalizeString)
  @IsOptional()
  @IsString({ message: 'URL изображения должен быть строкой' })
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'Некорректный URL изображения' },
  )
  @MaxLength(2048, {
    message: 'URL изображения не должен превышать 2048 символов',
  })
  imageUrl?: string | null;
}
