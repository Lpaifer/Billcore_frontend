import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { subscribeNotificationsUpdated } from "../auth/notificationEvents";
import { listNotifications } from "../auth/notificationsApi";
import { getAccessToken } from "../auth/tokenStorage";

export function AuthenticatedShell() {
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async (): Promise<void> => {
    const token = getAccessToken();
    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      const notifications = await listNotifications(token);
      setUnreadCount(notifications.filter((item) => !item.isRead).length);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    void loadUnreadCount();
    const unsubscribe = subscribeNotificationsUpdated(() => {
      void loadUnreadCount();
    });

    return () => {
      unsubscribe();
    };
  }, [loadUnreadCount]);

  return (
    <div className="post-auth-shell">
      <aside className="side-nav">
        <div className="brand">BillCore</div>
        <nav className="side-nav-items">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
            Dashboard
          </NavLink>
          <NavLink to="/payable-accounts" className={({ isActive }) => (isActive ? "active" : "")}>
            Contas
          </NavLink>
          <NavLink to="/accounts/due-soon" className={({ isActive }) => (isActive ? "active" : "")}>
            A vencer
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => (isActive ? "active" : "")}>
            Notificacoes {unreadCount > 0 ? `(${unreadCount})` : ""}
          </NavLink>
          <NavLink to="/payable-accounts/new" className={({ isActive }) => (isActive ? "active" : "")}>
            Add Conta
          </NavLink>
        </nav>
      </aside>
      <main className="post-auth-content">
        <Outlet />
      </main>
    </div>
  );
}
