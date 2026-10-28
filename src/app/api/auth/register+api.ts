import { ServerConfig } from '@/server/config';
import { getContainer } from '@/server/container';
import { getClientIp, handle, jsonResponse, readJsonBody, sessionCookie } from '@/server/http/http';

export const POST = handle(async (request) => {
  const { authService, rateLimiter } = getContainer();
  rateLimiter.consume(`register:ip:${getClientIp(request)}`, ServerConfig.rateLimit.registerPerIp);

  const session = await authService.register(await readJsonBody(request));
  return jsonResponse(request, session, 201, {
    'Set-Cookie': sessionCookie(request, session.token, session.expiresAt),
  });
});
