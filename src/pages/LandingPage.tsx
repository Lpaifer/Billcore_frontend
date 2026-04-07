import { Link } from "react-router-dom";

const FEATURES = [
  {
    title: "Contas a pagar",
    description: "Acompanhe e gerencie todas as suas contas com datas de vencimento, valores e status."
  },
  {
    title: "Pagamentos",
    description: "Registre seus pagamentos e monitore seu fluxo financeiro."
  },
  {
    title: "Categorias e Fornecedores",
    description: "Organize suas despesas e fornecedores de forma eficiente."
  },
  {
    title: "Notificacoes",
    description: "Nunca mais perca um prazo de pagamento."
  },
  {
    title: "Anexos",
    description: "Guarde os recibos e documentos de cada conta."
  }
];

export function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-brand">BillCore</div>
        <div className="landing-header-actions">
          <Link to="/login" className="landing-link-button">
            Entrar
          </Link>
          <Link to="/register" className="landing-primary-button">
            Cadastre-se
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <aside className="landing-hero-brand">
          <h1>BillCore</h1>
          <p>
            Simplifique suas contas a pagar. Acompanhe vencimentos, gerencie pagamentos e tenha mais
            clareza financeira em um so lugar.
          </p>
          <div className="landing-stat-grid">
            <article>
              <strong>12.847</strong>
              <span>Contas rastreadas</span>
            </article>
            <article>
              <strong>98,5%</strong>
              <span>Taxa de pontualidade</span>
            </article>
            <article>
              <strong>40h/mes</strong>
              <span>Tempo salvo</span>
            </article>
            <article>
              <strong>+2.300</strong>
              <span>Usuarios ativos</span>
            </article>
          </div>
        </aside>

        <div className="landing-hero-content">
          <h2>Tome controle de suas finanças</h2>
          <p>Administre todas suas contas em somente um lugar com toda visibilidade e controle.</p>
          <div className="landing-hero-actions">
            <Link to="/register" className="landing-primary-button">
              Comece agora
            </Link>
            <Link to="/login" className="landing-outline-button">
              Entrar
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <h3>Tudo que voce precisa.</h3>
        <p>Funcionalidades poderosas projetadas para pessoas que desejam manter o controle dos pagamentos.</p>
        <div className="landing-feature-grid">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="landing-feature-card">
              <div className="landing-feature-icon" />
              <h4>{feature.title}</h4>
              <span>{feature.description}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-dashboard-note">
        <h3>Dashboard inteligente</h3>
        <p>Acompanhe suas finanças em tempo real com total clareza.</p>
      </section>

      <footer className="landing-footer">
        <div className="landing-brand">BillCore</div>
        <div className="landing-footer-links">
          <button type="button">Sobre Nos</button>
          <button type="button">Contato</button>
          <button type="button">Termos</button>
        </div>
      </footer>
    </div>
  );
}
