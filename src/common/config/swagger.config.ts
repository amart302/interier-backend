import { DocumentBuilder } from '@nestjs/swagger';

export function createSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Interier Backend API')
    .setDescription('API каталога товаров и авторизации администратора')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
}
