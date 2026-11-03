import type { MeResponse } from '@/shared/types/auth';
import { ServerConfig } from '@/server/config';
import { getContainer } from '@/server/container';
import { binaryResponse, getSessionToken, handle, jsonResponse, readMultipartFile } from '@/server/http/http';

export const GET = handle(async (request) => {
  const { authService, profileService } = getContainer();
  const user = await authService.authenticate(getSessionToken(request));

  const { bytes, mimeType } = await profileService.readAvatar(user);
  return binaryResponse(request, bytes, mimeType);
});

export const PUT = handle(async (request) => {
  const { authService, profileService, rateLimiter } = getContainer();
  const user = await authService.authenticate(getSessionToken(request));
  rateLimiter.consume(`avatar:update:${user.id}`, ServerConfig.rateLimit.avatarUpdatesPerUser);

  const bytes = await readMultipartFile(request, 'photo', ServerConfig.photos.maxBytes);
  const body: MeResponse = { user: await profileService.updateAvatar(user.id, bytes) };
  return jsonResponse(request, body);
});

export const DELETE = handle(async (request) => {
  const { authService, profileService } = getContainer();
  const user = await authService.authenticate(getSessionToken(request));

  const body: MeResponse = { user: await profileService.removeAvatar(user.id) };
  return jsonResponse(request, body);
});
