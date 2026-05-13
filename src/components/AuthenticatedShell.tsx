import { type MouseEvent as ReactMouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { emitNotificationsUpdated, subscribeNotificationsUpdated } from "../auth/notificationEvents";
import { listNotifications, markNotificationAsRead, type NotificationItem } from "../auth/notificationsApi";
import { getAccessToken } from "../auth/tokenStorage";

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).format(date);
}

function NotificationBell() {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingReadId, setPendingReadId] = useState<string | null>(null);
  const [items, setItems] = useState<NotificationItem[]>([]);

  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items]);

  const loadNotifications = useCallback(async (): Promise<void> => {
    const token = getAccessToken();
    if (!token) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const notifications = await listNotifications(token);
      setItems(notifications);
      emitNotificationsUpdated();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Nao foi possivel carregar notificacoes.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
    const unsubscribe = subscribeNotificationsUpdated(() => {
      void loadNotifications();
    });
    return () => {
      unsubscribe();
    };
  }, [loadNotifications]);

  useEffect(() => {
    function handleClickOutside(event: globalThis.MouseEvent): void {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  async function handleMarkAsRead(event: ReactMouseEvent, id: string): Promise<void> {
    event.stopPropagation();
    const token = getAccessToken();
    if (!token) {
      return;
    }

    setPendingReadId(id);
    try {
      const updated = await markNotificationAsRead(token, id);
      setItems((current) => {
        const next = current.map((item) => (item.id === updated.id ? updated : item));
        emitNotificationsUpdated();
        return next;
      });
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Nao foi possivel marcar notificacao.";
      setError(message);
    } finally {
      setPendingReadId(null);
    }
  }

  function openRelatedPayable(notification: NotificationItem): void {
    if (!notification.payableAccountId) {
      return;
    }
    setIsOpen(false);
    navigate(`/payable-accounts/${notification.payableAccountId}/edit`);
  }

  return (
    <div className="notification-bell-wrap" ref={panelRef}>
      <button type="button" className="notification-bell-button" onClick={() => setIsOpen((value) => !value)}>
        <span className="notification-bell-icon" aria-hidden="true">
          🔔
        </span>
        {unreadCount > 0 ? <span className="notification-badge">{unreadCount}</span> : null}
      </button>

      {isOpen ? (
        <div className="notification-panel">
          <header>
            <strong>Notificacoes</strong>
            <span>Nao lidas: {unreadCount}</span>
          </header>

          {isLoading ? <p>Carregando...</p> : null}
          {!isLoading && error ? <p className="board-error">{error}</p> : null}
          {!isLoading && !error && items.length === 0 ? <p>Nenhuma notificacao.</p> : null}

          {!isLoading && !error ? (
            <div className="notification-panel-list">
              {items.slice(0, 8).map((item) => (
                <article
                  key={item.id}
                  className={`notification-panel-item ${item.isRead ? "is-read" : "is-unread"} ${item.payableAccountId ? "is-clickable" : ""}`}
                  onClick={() => openRelatedPayable(item)}
                >
                  <div className="notification-panel-title-row">
                    <strong>{item.title}</strong>
                    <span>{formatDateTime(item.createdAt)}</span>
                  </div>
                  <p>{item.message}</p>
                  <div className="notification-panel-actions">
                    {item.payableAccountId ? <small>Ver conta</small> : <small>Sem conta vinculada</small>}
                    {!item.isRead ? (
                      <button
                        type="button"
                        onClick={(event) => void handleMarkAsRead(event, item.id)}
                        disabled={pendingReadId === item.id}
                      >
                        {pendingReadId === item.id ? "..." : "Marcar lida"}
                      </button>
                    ) : (
                      <small className="notification-read-label">Lida</small>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function AuthenticatedShell() {
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
          <NavLink to="/categories" className={({ isActive }) => (isActive ? "active" : "")}>
            Categorias
          </NavLink>
          <NavLink to="/accounts/due-soon" className={({ isActive }) => (isActive ? "active" : "")}>
            A vencer
          </NavLink>
          <NavLink to="/payable-accounts/new" className={({ isActive }) => (isActive ? "active" : "")}>
            Add Conta
          </NavLink>
        </nav>
      </aside>
      <main className="post-auth-content">
        <div className="top-action-bar">
          <NotificationBell />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
