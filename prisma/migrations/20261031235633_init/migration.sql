-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN');

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" TEXT NOT NULL,
    "imageUrl" VARCHAR(2048),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" TEXT NOT NULL,
    "imageUrl" VARCHAR(2048),
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "sourceUrl" VARCHAR(2048) NOT NULL,
    "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "price" INTEGER,
    "brand" VARCHAR(255),
    "categoryId" INTEGER NOT NULL,
    "subcategoryId" INTEGER,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_dimensions" (
    "productId" INTEGER NOT NULL,
    "heightMm" DECIMAL(10,2),
    "widthMm" DECIMAL(10,2),
    "lengthMm" DECIMAL(10,2),
    "diameterMm" DECIMAL(10,2),
    "baseDiameterMm" DECIMAL(10,2),
    "mountingHoleDiameterMm" DECIMAL(10,2),

    CONSTRAINT "product_dimensions_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "product_electrical" (
    "productId" INTEGER NOT NULL,
    "voltageV" DECIMAL(12,3),
    "maxLampPowerW" DECIMAL(12,3),
    "maxProductPowerW" DECIMAL(12,3),
    "powerConsumptionW" DECIMAL(12,3),
    "lampCount" INTEGER,
    "lampBase" VARCHAR(255),
    "ipRating" VARCHAR(255),

    CONSTRAINT "product_electrical_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "product_appearance" (
    "productId" INTEGER NOT NULL,
    "frameColor" VARCHAR(255),
    "lampshadeColor" VARCHAR(255),
    "baseColor" VARCHAR(255),
    "frameMaterial" VARCHAR(255),
    "lampshadeMaterial" VARCHAR(255),
    "diffuserShape" VARCHAR(255),
    "mountingMethod" VARCHAR(255),

    CONSTRAINT "product_appearance_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "product_packaging" (
    "productId" INTEGER NOT NULL,
    "packaging" VARCHAR(255),
    "quantityPerPackage" INTEGER,
    "heightCm" DECIMAL(10,2),
    "widthCm" DECIMAL(10,2),
    "lengthCm" DECIMAL(10,2),
    "weightKg" DECIMAL(10,3),
    "volumeM3" DECIMAL(12,6),

    CONSTRAINT "product_packaging_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "attributes" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "AttributeType" NOT NULL,
    "unit" VARCHAR(50),

    CONSTRAINT "attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_attributes" (
    "productId" INTEGER NOT NULL,
    "attributeId" INTEGER NOT NULL,
    "textValue" TEXT,
    "numberValue" DECIMAL(20,6),
    "booleanValue" BOOLEAN,

    CONSTRAINT "product_attributes_pkey" PRIMARY KEY ("productId","attributeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "subcategories_categoryId_name_key" ON "subcategories"("categoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "subcategories_categoryId_slug_key" ON "subcategories"("categoryId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_sourceUrl_key" ON "products"("sourceUrl");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_subcategoryId_idx" ON "products"("subcategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "attributes_key_key" ON "attributes"("key");

-- CreateIndex
CREATE INDEX "product_attributes_attributeId_numberValue_idx" ON "product_attributes"("attributeId", "numberValue");

-- CreateIndex
CREATE INDEX "product_attributes_attributeId_booleanValue_idx" ON "product_attributes"("attributeId", "booleanValue");

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_dimensions" ADD CONSTRAINT "product_dimensions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_electrical" ADD CONSTRAINT "product_electrical_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_appearance" ADD CONSTRAINT "product_appearance_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_packaging" ADD CONSTRAINT "product_packaging_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "attributes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
