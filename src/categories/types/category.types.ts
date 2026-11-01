import { Prisma } from '@/generated/prisma/client';

import { categoryCardSelect } from '../selects/category.selects';

export type CategoryCard = Prisma.CategoryGetPayload<{
  select: typeof categoryCardSelect;
}>;
