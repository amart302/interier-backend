import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import {
  ServiceDataResponse,
  ServiceMessageResponse,
} from '@/common/types/service-response.types';
import { Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { categoryCardSelect } from './selects/category.selects';
import { CategoryCard } from './types/category.types';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async create(
    dto: CreateCategoryDto,
  ): Promise<ServiceDataResponse<CategoryCard>> {
    this.logger.log(`Category creation started (slug=${dto.slug})`);

    let category: CategoryCard;

    try {
      category = await this.prismaService.category.create({
        data: dto,
        select: categoryCardSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Category creation failed: name or slug already exists (slug=${dto.slug})`,
        );

        throw new ConflictException(
          'Категория с таким названием или slug уже существует',
        );
      }

      throw error;
    }

    this.logger.log(
      `Category creation completed successfully (id=${category.id})`,
    );

    return {
      message: 'Категория успешно создана',
      data: category,
    };
  }

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

  async update(
    id: number,
    dto: UpdateCategoryDto,
  ): Promise<ServiceDataResponse<CategoryCard>> {
    this.logger.log(`Category update started (id=${id})`);

    let category: CategoryCard;

    try {
      category = await this.prismaService.category.update({
        where: { id },
        data: dto,
        select: categoryCardSelect,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(
            `Category update failed: category not found (id=${id})`,
          );

          throw new NotFoundException('Категория не найдена');
        }

        if (error.code === 'P2002') {
          this.logger.warn(
            `Category update failed: name or slug already exists (id=${id})`,
          );

          throw new ConflictException(
            'Категория с таким названием или slug уже существует',
          );
        }
      }

      throw error;
    }

    this.logger.log(`Category update completed successfully (id=${id})`);

    return {
      message: 'Категория успешно обновлена',
      data: category,
    };
  }

  async remove(id: number): Promise<ServiceMessageResponse> {
    this.logger.log(`Category deletion started (id=${id})`);

    try {
      await this.prismaService.category.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        this.logger.warn(
          `Category deletion failed: category not found (id=${id})`,
        );

        throw new NotFoundException('Категория не найдена');
      }

      throw error;
    }

    this.logger.log(`Category deletion completed successfully (id=${id})`);

    return { message: 'Категория успешно удалена' };
  }
}
