export const productCardSelect = {
  id: true,
  name: true,
  imageUrls: true,
  price: true,
  packaging: {
    select: {
      quantityPerPackage: true,
    },
  },
} as const;
