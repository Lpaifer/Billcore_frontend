import { useEffect, useMemo, useState } from "react";
import { getActiveFinancialProfileId } from "../auth/financialProfileStorage";
import { type PayableAccount, listDueSoonPayableAccounts } from "../auth/payableAccountsApi";
import { getAccessToken } from "../auth/tokenStorage";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function daysUntilDue(dateText: string): number | null {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const today = new Date();
  const dueDateUtc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.floor((dueDateUtc - todayUtc) / (24 * 60 * 60 * 1000));
}

function dueBadgeLabel(dateText: string): string {
  const days = daysUntilDue(dateText);
  if (days === null) {
    return "Data invalida";
  }
  if (days <= 0) {
    return "Vence hoje";
  }
  if (days === 1) {
    return "Vence amanha";
  }
  return `Vence em ${days} dias`;
}

export function DueSoonPayableAccountsPage() {
  const token = getAccessToken();
  const financialProfileId = getActiveFinancialProfileId();
  const [items, setItems] = useState<PayableAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const blockedByConfig = !token || !financialProfileId;

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError(null);

      if (blockedByConfig) {
        setIsLoading(false);
        return;
      }

      try {
        const payables = await listDueSoonPayableAccounts(token, financialProfileId, 7);
        if (active) {
          setItems(payables);
        }
      } catch (requestError) {
        if (active) {
          const message = requestError instanceof Error ? requestError.message : "Nao foi possivel carregar contas.";
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
  }, [blockedByConfig, financialProfileId, token]);

  const totalText = useMemo(() => `Total de contas proximas: ${items.length}`, [items.length]);

  return (
    <section className="board">
      <header className="board-header">
        <h1>Contas a vencer</h1>
        <p>{totalText}</p>
      </header>

      {blockedByConfig ? <p className="board-warning">Perfil financeiro ativo nao encontrado.</p> : null}
      {error ? <p className="board-error">{error}</p> : null}

      <div className="table-wrap">
        <table className="payables-table">
          <thead>
            <tr>
              <th>Descricao</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Alerta</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4}>Carregando contas...</td>
              </tr>
            ) : null}
            {!isLoading && items.length === 0 ? (
              <tr>
                <td colSpan={4}>Nenhuma conta proxima do vencimento.</td>
              </tr>
            ) : null}
            {!isLoading
              ? items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td>{formatCurrency(item.originalAmount)}</td>
                    <td>{formatDate(item.dueDate)}</td>
                    <td>
                      <span className="due-soon-badge">{dueBadgeLabel(item.dueDate)}</span>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
