import { apiBaseUrl } from "./appConfig";
import { parseApiError } from "./authApi";

export type ProfileType = "PERSONAL" | "BUSINESS" | "HOUSEHOLD" | "OTHER";

export interface FinancialProfile {
  id: string;
  name: string;
  description: string | null;
  profileType: ProfileType;
  active: boolean;
  defaultCategoryId: string | null;
  createdAt: string;
}

export interface CreateFinancialProfileRequest {
  name: string;
  description?: string;
  profileType: ProfileType;
}

export async function listFinancialProfiles(token: string): Promise<FinancialProfile[]> {
  const response = await fetch(`${apiBaseUrl()}/api/v1/financial-profiles`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as FinancialProfile[];
}

export async function createFinancialProfile(
  token: string,
  request: CreateFinancialProfileRequest
): Promise<FinancialProfile> {
  const response = await fetch(`${apiBaseUrl()}/api/v1/financial-profiles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as FinancialProfile;
}
