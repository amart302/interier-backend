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

export class CreateSubcategoryDto {
  @ApiProperty({
    example: 'Люстры с LED-подсветкой',
    description: 'Название подкатегории',
    maxLength: 255,
  })
  @Transform(normalizeString)
  @IsDefined({ message: 'Название подкатегории обязательно' })
  @IsString({ message: 'Название подкатегории должно быть строкой' })
  @MinLength(1, { message: 'Название подкатегории не должно быть пустым' })
  @MaxLength(255, {
    message: 'Название подкатегории не должно превышать 255 символов',
  })
  name!: string;

  @ApiProperty({
    example: 'lyustry-s-led-podsvetkoy',
    description: 'Slug подкатегории: строчные латинские буквы, цифры и дефисы',
  })
  @Transform(normalizeString)
  @IsDefined({ message: 'Slug подкатегории обязателен' })
  @IsString({ message: 'Slug подкатегории должен быть строкой' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug подкатегории должен содержать строчные латинские буквы или цифры, разделенные дефисами',
  })
  slug!: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/lyustry-s-led-podsvetkoy.jpg',
    description: 'URL изображения подкатегории',
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
