import type { MeResponse } from '@/shared/types/auth';
import { getContainer } from '@/server/container';
import { getSessionToken, handle, jsonResponse } from '@/server/http/http';
import { toPublicUser } from '@/server/services/AuthService';

export const GET = handle(async (request) => {
  const user = await getContainer().authService.authenticate(getSessionToken(request));
  const body: MeResponse = { user: toPublicUser(user) };
  return jsonResponse(request, body);
});
