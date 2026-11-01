import { Controller, Get, Param } from '@nestjs/common';

import { SubcategoriesService } from './subcategories.service';

@Controller('categories/:categorySlug/subcategories')
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Get()
  findAll(@Param('categorySlug') categorySlug: string) {
    return this.subcategoriesService.findSubcategories(categorySlug);
  }
}
