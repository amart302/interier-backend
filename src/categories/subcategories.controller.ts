import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { subcategoryCardExample } from './docs/category.examples';
import { SubcategoriesService } from './subcategories.service';

@ApiTags('Subcategories')
@Controller('categories/:categorySlug/subcategories')
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить подкатегории категории' })
  @ApiParam({
    name: 'categorySlug',
    description: 'Slug категории',
    example: 'lyustry',
  })
  @ApiOkResponse({
    description: 'Подкатегории категории. Если их нет, data — пустой массив.',
    schema: {
      example: {
        success: true,
        message: 'Подкатегории успешно получены',
        data: [subcategoryCardExample],
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Категория не найдена',
    schema: {
      example: {
        success: false,
        statusCode: 404,
        message: 'Категория не найдена',
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
  findAll(@Param('categorySlug') categorySlug: string) {
    return this.subcategoriesService.findSubcategories(categorySlug);
  }
}
