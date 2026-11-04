import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PaginatedResult } from '@/common/types/pagination.types';
import {
  ServiceDataResponse,
  ServiceMessageResponse,
} from '@/common/types/service-response.types';
import { Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import { CreateProductDto } from './dto/create-product.dto';
import { FindAllProductsDto } from './dto/find-all-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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

  async create(
    dto: CreateProductDto,
  ): Promise<ServiceDataResponse<ProductDetails>> {
    this.logger.log(`Product creation started (categoryId=${dto.categoryId})`);

    let product: ProductDetails;

    try {
      product = await this.prismaService.$transaction(async (tx) => {
        await this.validateCategory(tx, dto.categoryId, dto.subcategoryId);

        return tx.product.create({ data: dto, select: productDetailsSelect });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          this.logger.warn(
            'Product creation failed: source URL already exists',
          );

          throw new ConflictException(
            'Товар с таким URL источника уже существует',
          );
        }

        if (error.code === 'P2003') {
          this.logger.warn(
            'Product creation failed: category or subcategory not found',
          );

          throw new NotFoundException('Категория или подкатегория не найдена');
        }
      }

      throw error;
    }

    this.logger.log(
      `Product creation completed successfully (id=${product.id})`,
    );

    return { message: 'Товар успешно создан', data: product };
  }

  async update(
    id: number,
    dto: UpdateProductDto,
  ): Promise<ServiceDataResponse<ProductDetails>> {
    this.logger.log(`Product update started (id=${id})`);

    let product: ProductDetails;

    try {
      product = await this.prismaService.$transaction(async (tx) => {
        const current = await tx.product.findUnique({
          where: { id },
          select: { categoryId: true, subcategoryId: true },
        });

        if (!current) {
          this.logger.warn(
            `Product update failed: product not found (id=${id})`,
          );

          throw new NotFoundException('Товар не найден');
        }

        await this.validateCategory(
          tx,
          dto.categoryId ?? current.categoryId,
          dto.subcategoryId === undefined
            ? current.subcategoryId
            : dto.subcategoryId,
        );

        return tx.product.update({
          where: { id },
          data: dto,
          select: productDetailsSelect,
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.warn(
            `Product update failed: product not found (id=${id})`,
          );

          throw new NotFoundException('Товар не найден');
        }

        if (error.code === 'P2002') {
          this.logger.warn(
            `Product update failed: source URL already exists (id=${id})`,
          );

          throw new ConflictException(
            'Товар с таким URL источника уже существует',
          );
        }

        if (error.code === 'P2003') {
          this.logger.warn(
            `Product update failed: category or subcategory not found (id=${id})`,
          );

          throw new NotFoundException('Категория или подкатегория не найдена');
        }
      }

      throw error;
    }

    this.logger.log(`Product update completed successfully (id=${id})`);

    return { message: 'Товар успешно обновлен', data: product };
  }

  async remove(id: number): Promise<ServiceMessageResponse> {
    this.logger.log(`Product deletion started (id=${id})`);

    try {
      await this.prismaService.product.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        this.logger.warn(
          `Product deletion failed: product not found (id=${id})`,
        );

        throw new NotFoundException('Товар не найден');
      }

      throw error;
    }

    this.logger.log(`Product deletion completed successfully (id=${id})`);

    return { message: 'Товар успешно удален' };
  }

  private async validateCategory(
    tx: Prisma.TransactionClient,
    categoryId: number,
    subcategoryId?: number | null,
  ): Promise<void> {
    const category = await tx.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) {
      this.logger.warn(
        `Product category validation failed: category not found (categoryId=${categoryId})`,
      );

      throw new NotFoundException('Категория не найдена');
    }

    if (subcategoryId === undefined || subcategoryId === null) return;

    const subcategory = await tx.subcategory.findUnique({
      where: { id: subcategoryId },
      select: { categoryId: true },
    });

    if (!subcategory) {
      this.logger.warn(
        `Product category validation failed: subcategory not found (subcategoryId=${subcategoryId})`,
      );

      throw new NotFoundException('Подкатегория не найдена');
    }

    if (subcategory.categoryId !== categoryId) {
      this.logger.warn(
        `Product category validation failed: subcategory belongs to another category (categoryId=${categoryId}, subcategoryId=${subcategoryId})`,
      );

      throw new BadRequestException(
        'Подкатегория не принадлежит указанной категории',
      );
    }
  }
}
