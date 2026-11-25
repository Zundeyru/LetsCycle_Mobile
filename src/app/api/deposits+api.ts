import type { DepositListResponse, DepositResponse } from '@/shared/types/deposits';
import { ServerConfig } from '@/server/config';
import { getContainer } from '@/server/container';
import { getSessionToken, handle, jsonResponse, readJsonBody } from '@/server/http/http';

export const GET = handle(async (request) => {
  const { authService, depositService } = getContainer();
  const user = await authService.authenticate(getSessionToken(request));

  const body: DepositListResponse = { deposits: await depositService.list(user.id) };
  return jsonResponse(request, body);
});

export const POST = handle(async (request) => {
  const { authService, depositService, rateLimiter } = getContainer();
  const user = await authService.authenticate(getSessionToken(request));
  rateLimiter.consume(`deposits:create:${user.id}`, ServerConfig.rateLimit.depositsPerUser);

  const body: DepositResponse = { deposit: await depositService.create(user.id, await readJsonBody(request)) };
  return jsonResponse(request, body, 201);
});
