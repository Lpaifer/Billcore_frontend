import { apiBaseUrl } from "./appConfig";
import { parseApiError } from "./authApi";

export interface CategoryOption {
  id: string;
  name: string;
}

export async function listCategories(token: string, financialProfileId: string): Promise<CategoryOption[]> {
  const response = await fetch(
    `${apiBaseUrl()}/api/v1/financial-profiles/${financialProfileId}/categories`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as CategoryOption[];
}
