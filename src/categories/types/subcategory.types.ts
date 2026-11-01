import { Prisma } from '@/generated/prisma/client';

import { subcategoryCardSelect } from '../selects/subcategory.selects';

export type SubcategoryCard = Prisma.SubcategoryGetPayload<{
  select: typeof subcategoryCardSelect;
}>;
