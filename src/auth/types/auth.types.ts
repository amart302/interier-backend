import type { ServiceDataResponse } from '@/common/types/service-response.types';

type AuthToken = { accessToken: string };

export type AuthWithTokenResponse = ServiceDataResponse<AuthToken>;
