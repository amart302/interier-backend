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

import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
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

  async create(
    categorySlug: string,
    dto: CreateSubcategoryDto,
  ): Promise<ServiceDataResponse<SubcategoryCard>> {
    this.logger.log(
      `Subcategory creation started (categorySlug=${categorySlug})`,
    );

    let subcategory: SubcategoryCard;

    try {
      subcategory = await this.prismaService.subcategory.create({
        data: { ...dto, category: { connect: { slug: categorySlug } } },
        select: subcategoryCardSelect,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(
            `Subcategory creation failed: category not found (categorySlug=${categorySlug})`,
          );

          throw new NotFoundException('Категория не найдена');
        }

        if (error.code === 'P2002') {
          this.logger.warn(
            `Subcategory creation failed: name or slug already exists (categorySlug=${categorySlug})`,
          );

          throw new ConflictException(
            'Подкатегория с таким названием или slug уже существует в этой категории',
          );
        }
      }

      throw error;
    }

    this.logger.log(
      `Subcategory creation completed successfully (categorySlug=${categorySlug})`,
    );

    return { message: 'Подкатегория успешно создана', data: subcategory };
  }

  async update(
    categorySlug: string,
    id: number,
    dto: UpdateSubcategoryDto,
  ): Promise<ServiceDataResponse<SubcategoryCard>> {
    this.logger.log(
      `Subcategory update started (categorySlug=${categorySlug}, id=${id})`,
    );

    let subcategory: SubcategoryCard;

    try {
      subcategory = await this.prismaService.subcategory.update({
        where: { id, category: { slug: categorySlug } },
        data: dto,
        select: subcategoryCardSelect,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(
            `Subcategory update failed: subcategory not found (categorySlug=${categorySlug}, id=${id})`,
          );

          throw new NotFoundException('Подкатегория не найдена');
        }

        if (error.code === 'P2002') {
          this.logger.warn(
            `Subcategory update failed: name or slug already exists (categorySlug=${categorySlug}, id=${id})`,
          );

          throw new ConflictException(
            'Подкатегория с таким названием или slug уже существует в этой категории',
          );
        }
      }

      throw error;
    }

    this.logger.log(
      `Subcategory update completed successfully (categorySlug=${categorySlug}, id=${id})`,
    );

    return { message: 'Подкатегория успешно обновлена', data: subcategory };
  }

  async remove(
    categorySlug: string,
    id: number,
  ): Promise<ServiceMessageResponse> {
    this.logger.log(
      `Subcategory deletion started (categorySlug=${categorySlug}, id=${id})`,
    );

    try {
      await this.prismaService.subcategory.delete({
        where: { id, category: { slug: categorySlug } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(
            `Subcategory deletion failed: subcategory not found (categorySlug=${categorySlug}, id=${id})`,
          );

          throw new NotFoundException('Подкатегория не найдена');
        }
      }

      throw error;
    }

    this.logger.log(
      `Subcategory deletion completed successfully (categorySlug=${categorySlug}, id=${id})`,
    );

    return { message: 'Подкатегория успешно удалена' };
  }
}
