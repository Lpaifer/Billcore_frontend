import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, register } from "../auth/authApi";
import {
  clearActiveDefaultCategoryId,
  clearActiveFinancialProfileId
} from "../auth/financialProfileStorage";
import { saveAccessToken } from "../auth/tokenStorage";
import { AuthSplitLayout } from "../components/AuthSplitLayout";

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Preencha nome, e-mail e senha.");
      return;
    }

    if (password.trim().length < 8) {
      setError("A senha precisa ter no mínimo 8 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password
      });

      const auth = await login({
        email: email.trim(),
        password
      });
      saveAccessToken(auth.accessToken);
      clearActiveFinancialProfileId();
      clearActiveDefaultCategoryId();
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Não foi possível cadastrar.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthSplitLayout>
      <div className="auth-form-wrap">
        <h2>Cadastre-se!</h2>
        <p className="auth-subtitle">Realize seu cadastro para gerenciar suas contas</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="register-name">Username</label>
          <input
            id="register-name"
            type="text"
            placeholder="usuario123"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="username"
          />

          <label htmlFor="register-email">E-mail</label>
          <input
            id="register-email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />

          <label htmlFor="register-password">Senha</label>
          <input
            id="register-password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
          />

          {error ? <p className="auth-error-message">{error}</p> : null}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Cadastrando..." : "Cadastre-se"}
          </button>
        </form>

        <p className="auth-switch">
          Já tem uma conta? <Link to="/login">Entre</Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
