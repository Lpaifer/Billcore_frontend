import { apiBaseUrl } from "./appConfig";
import { parseApiError } from "./authApi";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notificationType: "DUE_DATE" | "OVERDUE" | "SYSTEM";
  isRead: boolean;
  payableAccountId: string | null;
  createdAt: string;
}

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

export async function listNotifications(token: string): Promise<NotificationItem[]> {
  const response = await fetch(`${apiBaseUrl()}/api/v1/notifications`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as NotificationItem[];
}

export async function markNotificationAsRead(token: string, id: string): Promise<NotificationItem> {
  const response = await fetch(`${apiBaseUrl()}/api/v1/notifications/${id}/read`, {
    method: "PATCH",
    headers: authHeaders(token)
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as NotificationItem;
}
