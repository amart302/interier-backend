import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import type { ServiceMessageResponse } from '@/common/types/service-response.types';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async healthCheck(): Promise<ServiceMessageResponse> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      throw new ServiceUnavailableException('База данных недоступна', {
        cause: error,
      });
    }

    return { message: 'API и база данных доступны' };
  }
}
