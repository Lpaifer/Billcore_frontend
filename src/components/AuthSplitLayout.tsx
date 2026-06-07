import type { ReactNode } from "react";

interface AuthSplitLayoutProps {
  children: ReactNode;
}

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="auth-shell">
      <aside className="auth-brand-panel">
        <div className="auth-brand-content">
          <h1>BillCore</h1>
          <p>
            Simplifique suas contas a pagar. Acompanhe vencimentos, gerencie pagamentos e tenha mais
            clareza financeira, tudo em um só lugar.
          </p>
          <div className="auth-stats-placeholder" aria-hidden="true">
            <article className="auth-stat-card">
              <strong>100% web</strong>
              <span>Sem instalacao</span>
            </article>
            <article className="auth-stat-card">
              <strong>Alertas</strong>
              <span>Contra atrasos</span>
            </article>
            <article className="auth-stat-card">
              <strong>Dashboard</strong>
              <span>Indicadores claros</span>
            </article>
            <article className="auth-stat-card">
              <strong>Historico</strong>
              <span>Sempre acessivel</span>
            </article>
          </div>
        </div>
      </aside>
      <section className="auth-form-panel">{children}</section>
    </div>
  );
}
