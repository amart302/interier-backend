import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import type {
  AccessTokenPayload,
  AuthUser,
} from '@/common/types/auth-user.types';
import { ServiceDataResponse } from '@/common/types/service-response.types';
import { PrismaService } from '@/prisma/prisma.service';

import { LoginDto } from './dto/login.dto';
import type { AuthToken, CurrentUserData } from './types/auth.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async generateAccessToken(
    payload: AccessTokenPayload,
  ): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async login(dto: LoginDto): Promise<ServiceDataResponse<AuthToken>> {
    const { email, password } = dto;

    this.logger.log(`Sign-in started (email=${email})`);

    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        password: true,
      },
    });

    if (!user) {
      this.logger.warn(`Sign-in failed: user not found (email=${email})`);

      throw new UnauthorizedException('Неверный email или пароль');
    }

    if (!user.isActive) {
      this.logger.warn(`Sign-in failed: user inactive (userId=${user.id})`);

      throw new UnauthorizedException('Учетная запись деактивирована');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Sign-in failed: invalid password (userId=${user.id})`);

      throw new UnauthorizedException('Неверный email или пароль');
    }

    const accessToken = await this.generateAccessToken({
      sub: user.id,
    });

    this.logger.log(`Sign-in completed successfully (userId=${user.id})`);

    return {
      message: 'Вход в систему выполнен успешно',
      data: { accessToken },
    };
  }

  getMe(authUser: AuthUser): ServiceDataResponse<CurrentUserData> {
    this.logger.log('Get user started');

    const { sub, role } = authUser;

    this.logger.log(`Get user completed successfully (userId=${sub})`);

    return {
      message: 'Данные пользователя получены',
      data: { id: sub, role },
    };
  }
}
