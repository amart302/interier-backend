import { Prisma } from '@/generated/prisma/client';

import { productCardSelect } from '../selects/product.selects';

export type ProductCard = Prisma.ProductGetPayload<{
  select: typeof productCardSelect;
}>;
