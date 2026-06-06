import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardSummary, type DashboardSummary } from "../auth/dashboardApi";
import { getActiveFinancialProfileId } from "../auth/financialProfileStorage";
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
    : new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Pendente",
    OVERDUE: "Vencida",
    PAID: "Paga",
    CANCELED: "Cancelada"
  };
  return labels[status] ?? status;
}

function categoryPercent(amount: number, total: number): string {
  if (total <= 0) {
    return "0%";
  }
  return `${Math.max(4, Math.round((amount / total) * 100))}%`;
}

export function DashboardPage() {
  const token = getAccessToken();
  const financialProfileId = getActiveFinancialProfileId();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const blockedByConfig = !token || !financialProfileId;

  useEffect(() => {
    let active = true;

    async function loadDashboard(): Promise<void> {
      setIsLoading(true);
      setError(null);

      if (blockedByConfig) {
        setSummary(null);
        setIsLoading(false);
        return;
      }

      try {
        const dashboard = await getDashboardSummary(token, financialProfileId);
        if (active) {
          setSummary(dashboard);
        }
      } catch (requestError) {
        if (active) {
          const message = requestError instanceof Error ? requestError.message : "Nao foi possivel carregar o dashboard.";
          setError(message);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [blockedByConfig, financialProfileId, token]);

  const totalCategoryAmount = useMemo(
    () => summary?.categorySummary.reduce((total, category) => total + category.amount, 0) ?? 0,
    [summary]
  );

  const hasAnyAccount = summary
    ? Object.values(summary.statusSummary).some((count) => count > 0)
    : false;

  return (
    <section className="board">
      <header className="board-header">
        <h1>Dashboard</h1>
        <p>Visao financeira do perfil ativo.</p>
      </header>

      {blockedByConfig ? <p className="board-warning">Perfil financeiro ativo nao encontrado.</p> : null}
      {error ? <p className="board-error">{error}</p> : null}
      {isLoading ? <p className="dashboard-loading">Carregando dashboard...</p> : null}

      {!isLoading && summary && !hasAnyAccount ? (
        <div className="dashboard-empty">
          <strong>Nenhuma conta cadastrada ainda.</strong>
          <p>Cadastre contas a pagar para visualizar indicadores financeiros neste painel.</p>
          <Link className="primary-link-button" to="/payable-accounts/new">
            Adicionar conta
          </Link>
        </div>
      ) : null}

      {!isLoading && summary && hasAnyAccount ? (
        <>
          <div className="dashboard-metric-grid">
            <article className="dashboard-metric-card">
              <span>Total em aberto</span>
              <strong>{formatCurrency(summary.amountSummary.openAmount)}</strong>
              <small>{summary.statusSummary.pendingCount + summary.statusSummary.overdueCount} contas pendentes/vencidas</small>
            </article>
            <article className="dashboard-metric-card is-danger">
              <span>Total vencido</span>
              <strong>{formatCurrency(summary.amountSummary.overdueAmount)}</strong>
              <small>{summary.statusSummary.overdueCount} contas vencidas</small>
            </article>
            <article className="dashboard-metric-card is-warning">
              <span>Proximos 7 dias</span>
              <strong>{formatCurrency(summary.amountSummary.dueSoonAmount)}</strong>
              <small>Contas pendentes no curto prazo</small>
            </article>
            <article className="dashboard-metric-card is-ok">
              <span>Total pago</span>
              <strong>{formatCurrency(summary.amountSummary.paidAmount)}</strong>
              <small>{summary.statusSummary.paidCount} contas pagas</small>
            </article>
          </div>

          <div className="dashboard-grid">
            <section className="dashboard-panel">
              <header>
                <h2>Status das contas</h2>
                <span>{summary.statusSummary.canceledCount} canceladas</span>
              </header>
              <div className="dashboard-status-grid">
                <div>
                  <strong>{summary.statusSummary.pendingCount}</strong>
                  <span>Pendentes</span>
                </div>
                <div>
                  <strong>{summary.statusSummary.overdueCount}</strong>
                  <span>Vencidas</span>
                </div>
                <div>
                  <strong>{summary.statusSummary.paidCount}</strong>
                  <span>Pagas</span>
                </div>
              </div>
            </section>

            <section className="dashboard-panel">
              <header>
                <h2>Por categoria</h2>
                <span>{summary.categorySummary.length} categorias</span>
              </header>
              <div className="dashboard-category-list">
                {summary.categorySummary.map((category) => (
                  <article key={category.categoryId}>
                    <div>
                      <strong>{category.categoryName}</strong>
                      <span>{category.count} contas</span>
                    </div>
                    <small>{formatCurrency(category.amount)}</small>
                    <div className="dashboard-category-bar">
                      <span style={{ width: categoryPercent(category.amount, totalCategoryAmount) }} />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <section className="dashboard-panel dashboard-urgent-panel">
            <header>
              <h2>Contas urgentes</h2>
              <span>Vencidas e proximas do vencimento</span>
            </header>
            {summary.urgentAccounts.length === 0 ? (
              <p className="dashboard-muted">Nenhuma conta urgente no momento.</p>
            ) : (
              <div className="dashboard-urgent-list">
                {summary.urgentAccounts.map((account) => (
                  <Link key={account.id} to={`/payable-accounts/${account.id}/edit`}>
                    <div>
                      <strong>{account.description}</strong>
                      <span>{account.categoryName} - {formatDate(account.dueDate)}</span>
                    </div>
                    <div>
                      <small>{formatCurrency(account.originalAmount)}</small>
                      <span className={`status-pill ${account.status.toLowerCase()}`}>{statusLabel(account.status)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </section>
  );
}
