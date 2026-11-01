import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { ServiceDataResponse } from '@/common/types/service-response.types';
import { PrismaService } from '@/prisma/prisma.service';

import { subcategoryCardSelect } from './selects/subcategory.selects';
import { SubcategoryCard } from './types/subcategory.types';

@Injectable()
export class SubcategoriesService {
  private readonly logger = new Logger(SubcategoriesService.name);

  constructor(private readonly prismaService: PrismaService) {}

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
