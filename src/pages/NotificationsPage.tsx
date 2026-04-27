import { useEffect, useMemo, useState } from "react";
import { listNotifications, markNotificationAsRead, type NotificationItem } from "../auth/notificationsApi";
import { emitNotificationsUpdated } from "../auth/notificationEvents";
import { getAccessToken } from "../auth/tokenStorage";

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(date);
}

export function NotificationsPage() {
  const token = getAccessToken();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingReadId, setPendingReadId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError(null);

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const notifications = await listNotifications(token);
        if (active) {
          setItems(notifications);
          emitNotificationsUpdated();
        }
      } catch (requestError) {
        if (active) {
          const message = requestError instanceof Error ? requestError.message : "Nao foi possivel carregar notificacoes.";
          setError(message);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [token]);

  async function handleMarkAsRead(id: string): Promise<void> {
    if (!token) {
      return;
    }

    setPendingReadId(id);
    setError(null);
    try {
      const updated = await markNotificationAsRead(token, id);
      setItems((current) => {
        const next = current.map((item) => (item.id === updated.id ? updated : item));
        emitNotificationsUpdated();
        return next;
      });
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Nao foi possivel atualizar notificacao.";
      setError(message);
    } finally {
      setPendingReadId(null);
    }
  }

  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items]);

  return (
    <section className="board">
      <header className="board-header">
        <h1>Notificacoes</h1>
        <p>Nao lidas: {unreadCount}</p>
      </header>

      {!token ? <p className="board-warning">Sessao nao encontrada.</p> : null}
      {error ? <p className="board-error">{error}</p> : null}

      <div className="notifications-list">
        {isLoading ? <p>Carregando notificacoes...</p> : null}
        {!isLoading && items.length === 0 ? <p>Nenhuma notificacao encontrada.</p> : null}

        {!isLoading
          ? items.map((item) => (
              <article
                key={item.id}
                className={`notification-card ${item.isRead ? "is-read" : "is-unread"}`}
              >
                <div className="notification-card-header">
                  <h3>{item.title}</h3>
                  <span>{formatDateTime(item.createdAt)}</span>
                </div>
                <p>{item.message}</p>
                {!item.isRead ? (
                  <button
                    type="button"
                    onClick={() => void handleMarkAsRead(item.id)}
                    disabled={pendingReadId === item.id}
                  >
                    {pendingReadId === item.id ? "Atualizando..." : "Marcar como lida"}
                  </button>
                ) : (
                  <span className="notification-read-label">Lida</span>
                )}
              </article>
            ))
          : null}
      </div>
    </section>
  );
}
