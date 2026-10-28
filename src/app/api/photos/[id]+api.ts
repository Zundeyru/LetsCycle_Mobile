import { getContainer } from '@/server/container';
import { binaryResponse, getSessionToken, handle, jsonResponse } from '@/server/http/http';

type Params = { id: string };

export const GET = handle<Params>(async (request, { id }) => {
  const { authService, photoService } = getContainer();
  const user = await authService.authenticate(getSessionToken(request));

  const { photo, bytes } = await photoService.read(user.id, id);
  return binaryResponse(request, bytes, photo.mimeType);
});

export const DELETE = handle<Params>(async (request, { id }) => {
  const { authService, photoService } = getContainer();
  const user = await authService.authenticate(getSessionToken(request));

  await photoService.delete(user.id, id);
  return jsonResponse(request, { success: true });
});
