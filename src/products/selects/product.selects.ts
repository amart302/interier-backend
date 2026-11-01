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

export const productDetailsSelect = {
  ...productCardSelect,
  sourceUrl: true,
  brand: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  subcategory: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  dimensions: true,
  electrical: true,
  appearance: true,
  packaging: true,
  attributes: {
    select: {
      textValue: true,
      numberValue: true,
      booleanValue: true,
      attribute: {
        select: {
          key: true,
          name: true,
          type: true,
          unit: true,
        },
      },
    },
  },
} as const;
