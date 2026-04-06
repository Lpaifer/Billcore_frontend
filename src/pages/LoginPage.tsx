import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthSplitLayout } from "../components/AuthSplitLayout";
import { login } from "../auth/authApi";
import { saveAccessToken } from "../auth/tokenStorage";
import {
  clearActiveDefaultCategoryId,
  clearActiveFinancialProfileId
} from "../auth/financialProfileStorage";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Informe e-mail e senha para continuar.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await login({
        email: email.trim(),
        password
      });
      saveAccessToken(response.accessToken);
      clearActiveFinancialProfileId();
      clearActiveDefaultCategoryId();
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Não foi possível entrar.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthSplitLayout>
      <div className="auth-form-wrap">
        <h2>Bem-vindo de volta!</h2>
        <p className="auth-subtitle">Faça login para gerenciar suas contas</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="login-email">E-mail</label>
          <input
            id="login-email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />

          <label htmlFor="login-password">Senha</label>
          <input
            id="login-password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />

          {error ? <p className="auth-error-message">{error}</p> : null}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="auth-switch">
          Não tem uma conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
