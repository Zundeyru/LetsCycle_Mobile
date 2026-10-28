import { handle, jsonResponse } from '@/server/http/http';

export const GET = handle(async (request) => jsonResponse(request, { status: 'ok' }));
