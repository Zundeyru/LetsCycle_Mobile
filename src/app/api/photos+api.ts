import type { PhotoListResponse, PhotoUploadResponse } from '@/shared/types/photos';
import { ServerConfig } from '@/server/config';
import { getContainer } from '@/server/container';
import { getSessionToken, handle, jsonResponse, readMultipartFile } from '@/server/http/http';

export const GET = handle(async (request) => {
  const { authService, photoService } = getContainer();
  const user = await authService.authenticate(getSessionToken(request));

  const body: PhotoListResponse = { photos: await photoService.list(user.id) };
  return jsonResponse(request, body);
});

export const POST = handle(async (request) => {
  const { authService, photoService, rateLimiter } = getContainer();
  const user = await authService.authenticate(getSessionToken(request));
  rateLimiter.consume(`photos:upload:${user.id}`, ServerConfig.rateLimit.photoUploadsPerUser);

  const bytes = await readMultipartFile(request, 'photo', ServerConfig.photos.maxBytes);
  const body: PhotoUploadResponse = { photo: await photoService.upload(user.id, bytes) };
  return jsonResponse(request, body, 201);
});
