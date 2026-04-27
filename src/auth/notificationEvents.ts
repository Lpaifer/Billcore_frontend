const NOTIFICATIONS_UPDATED_EVENT = "billcore-notifications-updated";

export function emitNotificationsUpdated(): void {
  window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
}

export function subscribeNotificationsUpdated(listener: () => void): () => void {
  window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, listener);
  return () => window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, listener);
}
