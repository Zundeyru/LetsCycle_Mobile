import { ServerConfig } from '@/server/config';
import { getContainer } from '@/server/container';
import { getClientIp, handle, jsonResponse, readJsonBody, sessionCookie } from '@/server/http/http';

export const POST = handle(async (request) => {
  const { authService, rateLimiter } = getContainer();
  const { loginPerIp, loginPerEmail } = ServerConfig.rateLimit;
  rateLimiter.consume(`login:ip:${getClientIp(request)}`, loginPerIp);

  const body = await readJsonBody(request);
  const emailKey = `login:email:${String(body.email ?? '').trim().toLowerCase()}`;
  rateLimiter.consume(emailKey, loginPerEmail);

  const session = await authService.login(body);
  rateLimiter.reset(emailKey);
  return jsonResponse(request, session, 200, {
    'Set-Cookie': sessionCookie(request, session.token, session.expiresAt),
  });
});
