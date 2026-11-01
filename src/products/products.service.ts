import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PaginatedResult } from '@/common/types/pagination.types';
import { ServiceDataResponse } from '@/common/types/service-response.types';
import { Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import { FindAllProductsDto } from './dto/find-all-products.dto';
import {
  productCardSelect,
  productDetailsSelect,
} from './selects/product.selects';
import { ProductCard, ProductDetails } from './types/product.types';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async findAll(
    query: FindAllProductsDto,
  ): Promise<ServiceDataResponse<PaginatedResult<ProductCard>>> {
    this.logger.log('Products list lookup started');

    const {
      page = 1,
      limit = 20,
      categorySlug,
      subcategorySlug,
      search,
    } = query;

    if (subcategorySlug && !categorySlug) {
      this.logger.warn(
        `Products list lookup failed: categorySlug is required when subcategorySlug is provided (subcategorySlug=${subcategorySlug})`,
      );

      throw new BadRequestException(
        'Для фильтрации по подкатегории необходимо указать категорию',
      );
    }

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(categorySlug && {
        category: {
          slug: categorySlug,
        },
      }),

      ...(subcategorySlug && {
        subcategory: {
          slug: subcategorySlug,
          category: {
            slug: categorySlug,
          },
        },
      }),

      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      }),
    };

    const [products, total] = await this.prismaService.$transaction([
      this.prismaService.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: productCardSelect,
      }),
      this.prismaService.product.count({ where }),
    ]);

    this.logger.log(
      `Products list lookup completed successfully (items=${products.length}, total=${total}, page=${page})`,
    );

    return {
      message: 'Товары успешно получены',
      data: {
        items: products,
        meta: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOne(id: number): Promise<ServiceDataResponse<ProductDetails>> {
    this.logger.log(`Product lookup started (id=${id})`);

    const product = await this.prismaService.product.findUnique({
      where: { id },
      select: productDetailsSelect,
    });

    if (!product) {
      this.logger.warn(`Product lookup failed: product not found (id=${id})`);

      throw new NotFoundException('Товар не найден');
    }

    this.logger.log(`Product lookup completed successfully (id=${id})`);

    return {
      message: 'Товар успешно получен',
      data: product,
    };
  }
}
