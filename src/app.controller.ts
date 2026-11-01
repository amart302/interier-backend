import { Controller, Get } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import type { ServiceMessageResponse } from '@/common/types/service-response.types';

import { AppService } from './app.service';

@Controller()
@ApiTags('Health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Проверка доступности API' })
  @ApiOkResponse({
    description: 'API доступен. Подключение к базе данных не проверяется.',
    schema: {
      example: {
        success: true,
        message: 'Hello World!',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Внутренняя ошибка сервера',
    schema: {
      example: {
        success: false,
        statusCode: 500,
        message: 'Внутренняя ошибка сервера',
      },
    },
  })
  healthCheck(): ServiceMessageResponse {
    return this.appService.healthCheck();
  }
}
