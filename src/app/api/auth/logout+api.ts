import { getContainer } from '@/server/container';
import { clearSessionCookie, getSessionToken, handle, jsonResponse } from '@/server/http/http';

export const POST = handle(async (request) => {
  const token = getSessionToken(request);
  if (token) await getContainer().authService.logout(token);
  return jsonResponse(request, { success: true }, 200, { 'Set-Cookie': clearSessionCookie(request) });
});
