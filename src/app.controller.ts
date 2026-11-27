import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
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
    description: 'API и база данных доступны.',
    schema: {
      example: {
        success: true,
        message: 'API и база данных доступны',
      },
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'База данных недоступна',
    schema: {
      example: {
        success: false,
        statusCode: 503,
        message: 'Внутренняя ошибка сервера',
      },
    },
  })
  healthCheck(): Promise<ServiceMessageResponse> {
    return this.appService.healthCheck();
  }
}
