import { apiBaseUrl } from "./appConfig";
import { parseApiError } from "./authApi";

export interface CategoryOption {
  id: string;
  name: string;
}

export interface CategoryCreateRequest {
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
    if (response.status === 401) {
      throw new Error("AUTH_UNAUTHORIZED");
    }
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as CategoryOption[];
}

export async function createCategory(
  token: string,
  financialProfileId: string,
  request: CategoryCreateRequest
): Promise<CategoryOption> {
  const response = await fetch(
    `${apiBaseUrl()}/api/v1/financial-profiles/${financialProfileId}/categories`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(request)
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("AUTH_UNAUTHORIZED");
    }
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as CategoryOption;
}
