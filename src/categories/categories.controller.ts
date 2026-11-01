import { Controller, Get } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CategoriesService } from './categories.service';
import { categoryCardExample } from './docs/category.examples';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все категории' })
  @ApiOkResponse({
    description: 'Все категории. Если категорий нет, data — пустой массив.',
    schema: {
      example: {
        success: true,
        message: 'Категории успешно получены',
        data: [categoryCardExample],
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Внутренняя ошибка сервера',
    schema: {
      example: {
        success: false,
        statusCode: 500,
        message: 'Внутренняя ошибка сервера',
      },
    },
  })
  findAll() {
    return this.categoriesService.findAll();
  }
}
