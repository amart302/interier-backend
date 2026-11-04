import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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

import { CategoriesService } from './categories.service';
import { categoryCardExample } from './docs/category.examples';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Создать категорию' })
  @ApiCreatedResponse({
    description: 'Категория успешно создана',
    schema: {
      example: {
        success: true,
        message: 'Категория успешно создана',
        data: categoryCardExample,
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Некорректные данные категории' })
  @ApiConflictResponse({
    description: 'Категория с таким названием или slug уже существует',
  })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

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

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Обновить категорию' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Целочисленный ID категории',
  })
  @ApiOkResponse({
    description: 'Категория успешно обновлена',
    schema: {
      example: {
        success: true,
        message: 'Категория успешно обновлена',
        data: categoryCardExample,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Некорректный ID или данные категории',
  })
  @ApiNotFoundResponse({ description: 'Категория не найдена' })
  @ApiConflictResponse({
    description: 'Категория с таким названием или slug уже существует',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({
    summary: 'Удалить категорию',
    description:
      'Вместе с категорией удаляются ее подкатегории, товары и характеристики товаров.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Целочисленный ID категории',
  })
  @ApiOkResponse({
    description: 'Категория успешно удалена',
    schema: {
      example: { success: true, message: 'Категория успешно удалена' },
    },
  })
  @ApiBadRequestResponse({ description: 'Некорректный ID категории' })
  @ApiNotFoundResponse({ description: 'Категория не найдена' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
