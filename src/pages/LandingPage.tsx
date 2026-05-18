import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Feature = {
  icon: string;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: "=",
    title: "Nunca perca um vencimento",
    description: "Acompanhe contas a pagar com datas, valores e status sempre visiveis."
  },
  {
    icon: "$",
    title: "Pagamentos organizados",
    description: "Registre pagamentos realizados e mantenha um historico financeiro confiavel."
  },
  {
    icon: "<>",
    title: "Fornecedores centralizados",
    description: "Organize despesas por categoria e encontre informacoes rapidamente."
  },
  {
    icon: "!",
    title: "Alertas automaticos",
    description: "Receba notificacoes sobre vencimentos proximos e contas pendentes."
  },
  {
    icon: "@",
    title: "Comprovantes seguros",
    description: "Anexe recibos e documentos diretamente em cada conta."
  }
];

export function LandingPage() {
  const [showSurveyPopup, setShowSurveyPopup] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSurveyPopup(true);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSurveyPopup) {
      return undefined;
    }

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSurveyPopup(false);
      }
    };

    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [showSurveyPopup]);

  return (
    <div className="landing-page">
      {showSurveyPopup && (
        <div className="landing-popup-overlay" role="presentation">
          <div
            className="landing-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="survey-popup-title"
            aria-describedby="survey-popup-description"
          >
            <button
              type="button"
              className="landing-popup-close"
              aria-label="Fechar convite de pesquisa"
              onClick={() => setShowSurveyPopup(false)}
            >
              x
            </button>
            <span className="landing-popup-badge">Ajude a evoluir o BillCore</span>
            <h3 id="survey-popup-title">Sua opiniao vale muito para nos.</h3>
            <p id="survey-popup-description">
              Em menos de 2 minutos, voce ajuda a construir um BillCore mais simples, util e alinhado
              com a sua realidade. Participe da pesquisa e influencie as proximas melhorias do produto.
            </p>
            <div className="landing-popup-actions">
              <a
                href="https://forms.gle/fnpkBWeyYZDD36CE9"
                target="_blank"
                rel="noopener noreferrer"
                className="landing-primary-button"
              >
                Responder pesquisa
              </a>
              <button
                type="button"
                className="landing-popup-secondary"
                onClick={() => setShowSurveyPopup(false)}
              >
                Agora nao
              </button>
            </div>
          </div>
        </div>
      )}

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
            Organize suas contas, evite atrasos e acompanhe seus pagamentos com clareza em uma
            plataforma web inteligente.
          </p>
          <div className="landing-stat-grid">
            <article>
              <strong>100% web</strong>
              <span>Sem instalacao</span>
            </article>
            <article>
              <strong>Alertas</strong>
              <span>Contra atrasos</span>
            </article>
            <article>
              <strong>Dashboard</strong>
              <span>Indicadores claros</span>
            </article>
            <article>
              <strong>Historico</strong>
              <span>Sempre acessivel</span>
            </article>
          </div>
        </aside>

        <div className="landing-hero-content">
          <h2>Organize suas contas a pagar em um so lugar.</h2>
          <p>
            Centralize vencimentos, pagamentos, fornecedores e comprovantes em uma plataforma web
            simples, visual e segura.
          </p>
          <div className="landing-hero-actions">
            <Link to="/register" className="landing-primary-button">
              Comecar agora
            </Link>
            <Link to="/login" className="landing-outline-button">
              Entrar
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <h3>Menos atrasos, mais controle.</h3>
        <p>Resolva atrasos, comprovantes perdidos e pagamentos espalhados em uma unica plataforma web.</p>
        <div className="landing-feature-grid">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="landing-feature-card">
              <div className="landing-feature-icon" aria-hidden="true">
                {feature.icon}
              </div>
              <h4>{feature.title}</h4>
              <span>{feature.description}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-dashboard-note">
        <h3>Dashboard inteligente</h3>
        <p>Acompanhe suas financas em tempo real com total clareza.</p>

        <div className="landing-metrics-grid">
          <article className="metric-card metric-open">
            <span>Total em Aberto</span>
            <strong>R$14.290</strong>
            <small>-12% em rel. ao mes anterior</small>
          </article>
          <article className="metric-card metric-overdue">
            <span>Contas em Atraso</span>
            <strong>3</strong>
            <small>+2 em rel. ao mes anterior</small>
          </article>
          <article className="metric-card metric-week">
            <span>Vence esta semana</span>
            <strong>5</strong>
            <small>R$4.120 total</small>
          </article>
          <article className="metric-card metric-paid">
            <span>Pagos este mes</span>
            <strong>12</strong>
            <small>+3 em rel. ao mes anterior</small>
          </article>
        </div>

        <div className="landing-charts-grid">
          <article className="chart-card">
            <h4>Monthly Payment Trends</h4>
            <div className="bars" aria-hidden="true">
              <div className="bar-group">
                <span className="bar bar-a h-70" />
                <span className="bar bar-b h-35" />
              </div>
              <div className="bar-group">
                <span className="bar bar-a h-60" />
                <span className="bar bar-b h-45" />
              </div>
              <div className="bar-group">
                <span className="bar bar-a h-78" />
                <span className="bar bar-b h-28" />
              </div>
              <div className="bar-group">
                <span className="bar bar-a h-72" />
                <span className="bar bar-b h-32" />
              </div>
              <div className="bar-group">
                <span className="bar bar-a h-63" />
                <span className="bar bar-b h-44" />
              </div>
              <div className="bar-group">
                <span className="bar bar-a h-80" />
                <span className="bar bar-b h-26" />
              </div>
            </div>
          </article>

          <article className="chart-card">
            <h4>Bill Status</h4>
            <div className="donut-wrap">
              <div className="donut" aria-hidden="true" />
              <div className="donut-legend">
                <span>
                  <i className="dot paid" />
                  Paid
                </span>
                <span>
                  <i className="dot pending" />
                  Pending
                </span>
                <span>
                  <i className="dot overdue" />
                  Overdue
                </span>
              </div>
            </div>
          </article>
        </div>
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
