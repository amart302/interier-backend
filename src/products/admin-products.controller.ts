import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Auth } from '@/common/decorators/auth.decorator';
import { ParseIdPipe } from '@/common/pipes/parse-id.pipe';

import { FindAllProductsDto } from './dto/find-all-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('Admin Products')
@Controller('admin/products')
@Auth()
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список товаров, включая скрытые и уценку',
  })
  findAll(@Query() query: FindAllProductsDto) {
    return this.productsService.findAllForAdmin(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить товар для редактирования' })
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.productsService.findOneForAdmin(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить товар, в том числе его видимость' })
  update(@Param('id', ParseIdPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }
}
