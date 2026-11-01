import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import {
  productCardExample,
  productDetailsExample,
} from './docs/product.examples';
import { FindAllProductsDto } from './dto/find-all-products.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список товаров',
    description:
      'Поиск по названию без учёта регистра. Фильтры применяются совместно. Без фильтров возвращается страница всех товаров. subcategorySlug требует categorySlug. При отсутствии совпадений items — [], total и pages — 0.',
  })
  @ApiOkResponse({
    description: 'Товары успешно получены',
    schema: {
      example: {
        success: true,
        message: 'Товары успешно получены',
        data: {
          items: [productCardExample],
          meta: { total: 3212, page: 1, limit: 1, pages: 3212 },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Ошибка валидации query или подкатегория передана без категории',
    content: {
      'application/json': {
        examples: {
          validation: {
            summary: 'Ошибка валидации DTO',
            value: {
              success: false,
              statusCode: 400,
              message: ['Количество записей не должно превышать 100'],
            },
          },
          categoryRequired: {
            summary: 'Не указана категория',
            value: {
              success: false,
              statusCode: 400,
              message:
                'Для фильтрации по подкатегории необходимо указать категорию',
            },
          },
        },
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
  findAll(@Query() query: FindAllProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить подробную информацию о товаре',
    description:
      'Необязательные связи и значения могут быть null, attributes — пустым массивом. Decimal-поля характеристик сериализуются строками.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Целочисленный ID товара',
  })
  @ApiOkResponse({
    description: 'Товар успешно получен',
    schema: {
      example: {
        success: true,
        message: 'Товар успешно получен',
        data: productDetailsExample,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Некорректный ID товара: ожидается целое число',
    schema: {
      example: {
        success: false,
        statusCode: 400,
        message: 'Validation failed (numeric string is expected)',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Товар не найден',
    schema: {
      example: { success: false, statusCode: 404, message: 'Товар не найден' },
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }
}
