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
            <div className="auth-stat-card" />
            <div className="auth-stat-card" />
            <div className="auth-stat-card" />
            <div className="auth-stat-card" />
          </div>
        </div>
      </aside>
      <section className="auth-form-panel">{children}</section>
    </div>
  );
}
