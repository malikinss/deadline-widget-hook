import { HttpError } from "../http";

export async function parsePageId(req: Request): Promise<string> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, "invalid JSON body");
  }

  const id = (body as { data?: { id?: unknown } } | null)?.data?.id;
  if (typeof id !== "string" || id.length === 0) {
    throw new HttpError(400, "missing data.id");
  }
  return id;
}