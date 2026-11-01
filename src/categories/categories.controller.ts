import { Controller, Get, Param } from '@nestjs/common';

import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':categorySlug/subcategories')
  findSubcategories(@Param('categorySlug') categorySlug: string) {
    return this.categoriesService.findSubcategories(categorySlug);
  }
}
