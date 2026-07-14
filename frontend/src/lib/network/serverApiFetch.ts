import { headers } from "next/headers";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

/**
 * Server-side fetch to get data which already rendered, so the page will load instantly.
 */
export async function serverApiFetch(path: string): Promise<Response> {
  const cookie = (await headers()).get("cookie") ?? "";

  try {
    return await fetch(`${BACKEND_API_URL}${path}`, {
      headers: { cookie },
      cache: "no-store",
    });
  } catch (cause) {
    throw new Error(`Backend unreachable: ${BACKEND_API_URL}${path}`, {
      cause,
    });
  }
}
