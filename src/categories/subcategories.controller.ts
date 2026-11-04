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

import { subcategoryCardExample } from './docs/category.examples';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
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
  @Post()
  @Auth()
  @ApiOperation({ summary: 'Создать подкатегорию' })
  @ApiParam({
    name: 'categorySlug',
    description: 'Slug категории',
    example: 'lyustry',
  })
  @ApiCreatedResponse({
    description: 'Подкатегория успешно создана',
    schema: {
      example: {
        success: true,
        message: 'Подкатегория успешно создана',
        data: subcategoryCardExample,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные или ID подкатегории',
  })
  @ApiNotFoundResponse({ description: 'Категория не найдена' })
  @ApiConflictResponse({
    description:
      'Подкатегория с таким названием или slug уже существует в этой категории',
  })
  create(
    @Param('categorySlug') categorySlug: string,
    @Body() dto: CreateSubcategoryDto,
  ) {
    return this.subcategoriesService.create(categorySlug, dto);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Обновить подкатегорию' })
  @ApiParam({
    name: 'categorySlug',
    description: 'Slug категории',
    example: 'lyustry',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Целочисленный ID подкатегории',
  })
  @ApiOkResponse({
    description: 'Подкатегория успешно обновлена',
    schema: {
      example: {
        success: true,
        message: 'Подкатегория успешно обновлена',
        data: subcategoryCardExample,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные или ID подкатегории',
  })
  @ApiNotFoundResponse({
    description: 'Подкатегория в указанной категории не найдена',
  })
  @ApiConflictResponse({
    description:
      'Подкатегория с таким названием или slug уже существует в этой категории',
  })
  update(
    @Param('categorySlug') categorySlug: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubcategoryDto,
  ) {
    return this.subcategoriesService.update(categorySlug, id, dto);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({
    summary: 'Удалить подкатегорию',
    description:
      'Вместе с подкатегорией удаляются ее товары и их характеристики.',
  })
  @ApiParam({
    name: 'categorySlug',
    description: 'Slug категории',
    example: 'lyustry',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Целочисленный ID подкатегории',
  })
  @ApiOkResponse({
    description: 'Подкатегория успешно удалена',
    schema: {
      example: { success: true, message: 'Подкатегория успешно удалена' },
    },
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные или ID подкатегории',
  })
  @ApiNotFoundResponse({
    description: 'Подкатегория в указанной категории не найдена',
  })
  remove(
    @Param('categorySlug') categorySlug: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.subcategoriesService.remove(categorySlug, id);
  }
}
