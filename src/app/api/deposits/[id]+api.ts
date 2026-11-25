import type { DepositResponse } from '@/shared/types/deposits';
import { getContainer } from '@/server/container';
import { getSessionToken, handle, jsonResponse, readJsonBody } from '@/server/http/http';

type Params = { id: string };

/** PATCH /api/deposits/:id  body { status: 'scheduled' | 'completed' } */
export const PATCH = handle<Params>(async (request, { id }) => {
  const { authService, depositService } = getContainer();
  const user = await authService.authenticate(getSessionToken(request));

  const body: DepositResponse = { deposit: await depositService.updateStatus(user.id, id, await readJsonBody(request)) };
  return jsonResponse(request, body);
});
