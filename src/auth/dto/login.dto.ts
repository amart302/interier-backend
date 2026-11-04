import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { normalizeString } from '@/common/transformers/normalize-string.transformer';

export class LoginDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Email администратора',
    maxLength: 255,
  })
  @Transform(normalizeString)
  @IsDefined({ message: 'Email обязателен' })
  @IsEmail({}, { message: 'Некорректный email' })
  @MaxLength(255, {
    message: 'Email не должен превышать 255 символов',
  })
  email!: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Пароль администратора',
    minLength: 1,
    maxLength: 255,
  })
  @IsDefined({ message: 'Пароль обязателен' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(8, {
    message: 'Пароль должен содержать не менее 8 символов',
  })
  @MaxLength(255, {
    message: 'Пароль не должен превышать 255 символов',
  })
  password!: string;
}
