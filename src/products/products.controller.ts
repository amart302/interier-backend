import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { Auth } from '@/common/decorators/auth.decorator';

import {
  productCardExample,
  productDetailsExample,
} from './docs/product.examples';
import { CreateProductDto } from './dto/create-product.dto';
import { FindAllProductsDto } from './dto/find-all-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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
  @Post()
  @Auth()
  @ApiOperation({ summary: 'Создать товар' })
  @ApiCreatedResponse({
    description: 'Товар успешно создан',
    schema: {
      example: {
        success: true,
        message: 'Товар успешно создан',
        data: productDetailsExample,
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Некорректные данные или ID товара, либо подкатегория не принадлежит категории',
  })
  @ApiNotFoundResponse({
    description: 'Товар, категория или подкатегория не найдены',
  })
  @ApiConflictResponse({
    description: 'Товар с таким URL источника уже существует',
  })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Обновить товар' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Целочисленный ID товара',
  })
  @ApiOkResponse({
    description: 'Товар успешно обновлен',
    schema: {
      example: {
        success: true,
        message: 'Товар успешно обновлен',
        data: productDetailsExample,
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Некорректные данные или ID товара, либо подкатегория не принадлежит категории',
  })
  @ApiNotFoundResponse({
    description: 'Товар, категория или подкатегория не найдены',
  })
  @ApiConflictResponse({
    description: 'Товар с таким URL источника уже существует',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Удалить товар' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Целочисленный ID товара',
  })
  @ApiOkResponse({
    description: 'Товар успешно удален',
    schema: { example: { success: true, message: 'Товар успешно удален' } },
  })
  @ApiBadRequestResponse({ description: 'Некорректные данные или ID товара' })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
