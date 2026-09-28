import { SECRET_HEADER } from "../config";

export function isAuthorized(req: Request, secret: string): boolean {
  const provided = req.headers.get(SECRET_HEADER);
  if (!provided) return false;

  const encoder = new TextEncoder();
  const a = encoder.encode(provided);
  const b = encoder.encode(secret);

  if (a.byteLength !== b.byteLength) return false;
  return crypto.subtle.timingSafeEqual(a, b);
}