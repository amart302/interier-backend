import { Injectable, Logger } from '@nestjs/common';

import { ServiceDataResponse } from '@/common/types/service-response.types';
import { PrismaService } from '@/prisma/prisma.service';

import { categoryCardSelect } from './selects/category.selects';
import { CategoryCard } from './types/category.types';

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
}
