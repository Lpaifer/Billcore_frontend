import { apiBaseUrl } from "./appConfig";
import { parseApiError } from "./authApi";

export interface DashboardStatusSummary {
  pendingCount: number;
  overdueCount: number;
  paidCount: number;
  canceledCount: number;
}

export interface DashboardAmountSummary {
  openAmount: number;
  overdueAmount: number;
  paidAmount: number;
  dueSoonAmount: number;
}

export interface DashboardCategorySummary {
  categoryId: string;
  categoryName: string;
  amount: number;
  count: number;
}

export interface DashboardUrgentAccount {
  id: string;
  description: string;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELED";
  originalAmount: number;
  categoryName: string;
}

export interface DashboardSummary {
  financialProfileId: string;
  statusSummary: DashboardStatusSummary;
  amountSummary: DashboardAmountSummary;
  categorySummary: DashboardCategorySummary[];
  urgentAccounts: DashboardUrgentAccount[];
}

export async function getDashboardSummary(token: string, financialProfileId: string): Promise<DashboardSummary> {
  const response = await fetch(`${apiBaseUrl()}/api/v1/financial-profiles/${financialProfileId}/dashboard`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as DashboardSummary;
}
