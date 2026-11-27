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
  adminProductCardSelect,
  adminProductDetailsSelect,
  productCardSelect,
  productDetailsSelect,
} from './selects/product.selects';
import { AdminProductDetails, ProductDetails } from './types/product.types';

const publicProductWhere: Prisma.ProductWhereInput = {
  isHidden: false,
  NOT: [
    { category: { OR: [{ isOutlet: true }, { slug: 'utsenka' }] } },
    { name: { contains: 'уценк', mode: 'insensitive' } },
  ],
};

type ProductPrices = {
  price: Prisma.Decimal | null;
  oldPrice: Prisma.Decimal | null;
};
type ProductWithNumericPrices<Product> = Omit<Product, 'price' | 'oldPrice'> & {
  price: number | null;
  oldPrice: number | null;
};

function validateOldPrice({ price, oldPrice }: ProductPrices): void {
  if (price !== null && oldPrice !== null && oldPrice.lte(price)) {
    throw new BadRequestException('Старая цена должна быть больше текущей');
  }
}

function withNumericPrices<Product extends ProductPrices>(
  product: Product,
): ProductWithNumericPrices<Product> {
  return {
    ...product,
    price: product.price?.toNumber() ?? null,
    oldPrice: product.oldPrice?.toNumber() ?? null,
  };
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  findAll(query: FindAllProductsDto) {
    return this.list(query, productCardSelect, publicProductWhere);
  }

  findAllForAdmin(query: FindAllProductsDto) {
    return this.list(query, adminProductCardSelect, {});
  }

  private async list<
    Select extends Prisma.ProductSelect & { price: true; oldPrice: true },
  >(
    query: FindAllProductsDto,
    select: Select,
    visibility: Prisma.ProductWhereInput,
  ): Promise<
    ServiceDataResponse<
      PaginatedResult<
        ProductWithNumericPrices<Prisma.ProductGetPayload<{ select: Select }>>
      >
    >
  > {
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
      ...visibility,
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

    const [products, total] = await this.prismaService.$transaction(
      async (tx) => {
        const products = await tx.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          select,
        });
        const total = await tx.product.count({ where });
        return [products, total] as const;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );

    this.logger.log(
      `Products list lookup completed successfully (items=${products.length}, total=${total}, page=${page})`,
    );

    return {
      message: 'Товары успешно получены',
      data: {
        items: products.map((product) =>
          withNumericPrices(product as typeof product & ProductPrices),
        ),
        meta: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  findOne(id: number) {
    return this.findById(id, productDetailsSelect, publicProductWhere);
  }

  findOneForAdmin(id: number) {
    return this.findById(id, adminProductDetailsSelect, {});
  }

  private async findById<
    Select extends Prisma.ProductSelect & { price: true; oldPrice: true },
  >(id: number, select: Select, visibility: Prisma.ProductWhereInput) {
    this.logger.log(`Product lookup started (id=${id})`);

    const product = await this.prismaService.product.findUnique({
      where: { id, AND: visibility },
      select,
    });

    if (!product) {
      this.logger.warn(`Product lookup failed: product not found (id=${id})`);

      throw new NotFoundException('Товар не найден');
    }

    this.logger.log(`Product lookup completed successfully (id=${id})`);

    return {
      message: 'Товар успешно получен',
      data: withNumericPrices(product as typeof product & ProductPrices),
    };
  }

  async create(
    dto: CreateProductDto,
  ): Promise<ServiceDataResponse<ProductWithNumericPrices<ProductDetails>>> {
    this.logger.log(`Product creation started (categoryId=${dto.categoryId})`);

    let product: ProductDetails;

    try {
      product = await this.prismaService.$transaction(async (tx) => {
        await this.validateCategory(tx, dto.categoryId, dto.subcategoryId);

        const created = await tx.product.create({
          data: dto,
          select: productDetailsSelect,
        });
        validateOldPrice(created);
        return created;
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

    return {
      message: 'Товар успешно создан',
      data: withNumericPrices(product),
    };
  }

  async update(
    id: number,
    dto: UpdateProductDto,
  ): Promise<
    ServiceDataResponse<ProductWithNumericPrices<AdminProductDetails>>
  > {
    this.logger.log(`Product update started (id=${id})`);

    let product: AdminProductDetails;

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

        const updated = await tx.product.update({
          where: { id },
          data: dto,
          select: adminProductDetailsSelect,
        });
        validateOldPrice(updated);
        return updated;
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

          throw new ConflictException(
            'Связь категории и подкатегории изменилась. Обновите данные и повторите попытку',
          );
        }
      }

      throw error;
    }

    this.logger.log(`Product update completed successfully (id=${id})`);

    return {
      message: 'Товар успешно обновлен',
      data: withNumericPrices(product),
    };
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
