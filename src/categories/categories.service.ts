import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { ServiceDataResponse } from '@/common/types/service-response.types';
import { PrismaService } from '@/prisma/prisma.service';

import { categoryCardSelect } from './selects/category.selects';
import { subcategoryCardSelect } from './selects/subcategory.selects';
import { CategoryCard } from './types/category.types';
import { SubcategoryCard } from './types/subcategory.types';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<ServiceDataResponse<CategoryCard[]>> {
    this.logger.log('Categories list lookup started');

    const categories = await this.prismaService.category.findMany({
      orderBy: { createdAt: 'desc' },
      select: categoryCardSelect,
    });

    this.logger.log(
      `Categories list lookup completed successfully (items=${categories.length})`,
    );

    return {
      message: 'Категории успешно получены',
      data: categories,
    };
  }

  async findSubcategories(
    categorySlug: string,
  ): Promise<ServiceDataResponse<SubcategoryCard[]>> {
    this.logger.log(
      `Category subcategories lookup started (categorySlug=${categorySlug})`,
    );

    const category = await this.prismaService.category.findUnique({
      where: { slug: categorySlug },
      select: {
        subcategories: {
          orderBy: { createdAt: 'desc' },
          select: subcategoryCardSelect,
        },
      },
    });

    if (!category) {
      this.logger.warn(
        `Category subcategories lookup failed: category not found (categorySlug=${categorySlug})`,
      );

      throw new NotFoundException('Категория не найдена');
    }

    this.logger.log(
      `Category subcategories lookup completed successfully (categorySlug=${categorySlug}, items=${category.subcategories.length})`,
    );

    return {
      message: 'Подкатегории успешно получены',
      data: category.subcategories,
    };
  }
}
