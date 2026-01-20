import type { Request as ExpressRequest } from 'express';

export function expressToFetchRequest(req: ExpressRequest): Request {
  const rawBody =
    (req as unknown as { rawBody: string }).rawBody ?? JSON.stringify(req.body);

  const fetchRequest = new Request(
    `${req.protocol}://${req.get('host')}${req.originalUrl}`,
    {
      method: req.method,
      headers: req.headers as unknown as HeadersInit,
      body: rawBody,
    },
  );

  return fetchRequest;
}
