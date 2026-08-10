import { Guest as GuestPath } from "../constants/apiPaths";
import { serverApiFetch } from "../network/serverApiFetch";
import { PublicGuest } from "../types/Guest";

export async function getPublicGuestByUuid(
  uuid: string,
): Promise<PublicGuest | null> {
  try {
    const response = await serverApiFetch(GuestPath.byBaseId(uuid));

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      console.error(`Failed to load guest ${uuid} (${response.status})`);
      return null;
    }

    return (await response.json()) as PublicGuest;
  } catch (e) {
    console.error(`Failed to load guest ${uuid}`, e);
    return null;
  }
}
