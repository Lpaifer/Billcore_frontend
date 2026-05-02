import { apiBaseUrl } from "./appConfig";
import { parseApiError } from "./authApi";

export interface PayableAccount {
  id: string;
  description: string;
  originalAmount: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELED";
  notes: string | null;
  financialProfileId: string;
  categoryId: string;
  supplierId: string | null;
  issueDate: string | null;
  competenceDate: string | null;
  createdAt: string;
}

export interface CreatePayableAccountRequest {
  description: string;
  originalAmount: number;
  dueDate: string;
  categoryId: string;
  notes?: string;
  status?: "PENDING" | "PAID";
}

export interface UpdatePayableAccountRequest {
  description: string;
  originalAmount: number;
  dueDate: string;
  categoryId: string;
  notes?: string;
  status?: "PENDING" | "PAID" | "OVERDUE" | "CANCELED";
}

export interface PayableAccountFilters {
  status?: "PENDING" | "PAID" | "OVERDUE" | "CANCELED";
  categoryId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

export async function listPayableAccounts(
  token: string,
  financialProfileId: string,
  filters?: PayableAccountFilters
): Promise<PayableAccount[]> {
  const params = new URLSearchParams();
  if (filters?.status) {
    params.set("status", filters.status);
  }
  if (filters?.categoryId) {
    params.set("categoryId", filters.categoryId);
  }
  if (filters?.dueDateFrom) {
    params.set("dueDateFrom", filters.dueDateFrom);
  }
  if (filters?.dueDateTo) {
    params.set("dueDateTo", filters.dueDateTo);
  }

  const query = params.toString();
  const response = await fetch(
    `${apiBaseUrl()}/api/v1/financial-profiles/${financialProfileId}/payable-accounts${query ? `?${query}` : ""}`,
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

  return (await response.json()) as PayableAccount[];
}

export async function listDueSoonPayableAccounts(
  token: string,
  financialProfileId: string,
  daysAhead = 7
): Promise<PayableAccount[]> {
  const response = await fetch(
    `${apiBaseUrl()}/api/v1/financial-profiles/${financialProfileId}/payable-accounts/due-soon?daysAhead=${daysAhead}`,
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

  return (await response.json()) as PayableAccount[];
}

export async function createPayableAccount(
  token: string,
  financialProfileId: string,
  request: CreatePayableAccountRequest
): Promise<PayableAccount> {
  const response = await fetch(
    `${apiBaseUrl()}/api/v1/financial-profiles/${financialProfileId}/payable-accounts`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(request)
    }
  );

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as PayableAccount;
}

export async function updatePayableAccount(
  token: string,
  payableAccountId: string,
  request: UpdatePayableAccountRequest
): Promise<PayableAccount> {
  const response = await fetch(`${apiBaseUrl()}/api/v1/payable-accounts/${payableAccountId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as PayableAccount;
}
