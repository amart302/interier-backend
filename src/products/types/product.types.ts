import { Prisma } from '@/generated/prisma/client';

import {
  productCardSelect,
  productDetailsSelect,
} from '../selects/product.selects';

export type ProductCard = Prisma.ProductGetPayload<{
  select: typeof productCardSelect;
}>;

export type ProductDetails = Prisma.ProductGetPayload<{
  select: typeof productDetailsSelect;
}>;
