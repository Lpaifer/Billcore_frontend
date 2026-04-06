import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createFinancialProfile, type ProfileType } from "../auth/financialProfileApi";
import {
  saveActiveDefaultCategoryId,
  saveActiveFinancialProfileId
} from "../auth/financialProfileStorage";
import { getAccessToken } from "../auth/tokenStorage";

const PROFILE_TYPES: Array<{ value: ProfileType; label: string }> = [
  { value: "PERSONAL", label: "Pessoal" },
  { value: "BUSINESS", label: "Empresarial" },
  { value: "HOUSEHOLD", label: "Residencial" },
  { value: "OTHER", label: "Outro" }
];

export function FinancialProfileOnboardingPage() {
  const navigate = useNavigate();
  const token = getAccessToken();

  const [name, setName] = useState("");
  const [profileType, setProfileType] = useState<ProfileType>("PERSONAL");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("Sessão inválida. Faça login novamente.");
      return;
    }

    if (!name.trim()) {
      setError("Informe um nome para o perfil financeiro.");
      return;
    }

    setIsSaving(true);
    try {
      const profile = await createFinancialProfile(token, {
        name: name.trim(),
        profileType,
        description: description.trim().length > 0 ? description.trim() : undefined
      });

      saveActiveFinancialProfileId(profile.id);
      saveActiveDefaultCategoryId(profile.defaultCategoryId);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível criar o perfil financeiro.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="onboarding-shell">
      <section className="onboarding-card">
        <h1>Crie seu Perfil Financeiro</h1>
        <p>Para continuar e cadastrar contas, configure primeiro seu perfil financeiro.</p>

        <form className="onboarding-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="profile-name">Nome do perfil</label>
          <input
            id="profile-name"
            type="text"
            placeholder="Ex.: Perfil Principal"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <label htmlFor="profile-type">Tipo</label>
          <select
            id="profile-type"
            value={profileType}
            onChange={(event) => setProfileType(event.target.value as ProfileType)}
          >
            {PROFILE_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label htmlFor="profile-description">Descrição (opcional)</label>
          <textarea
            id="profile-description"
            placeholder="Ex.: Gestão financeira pessoal"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          {error ? <p className="board-error">{error}</p> : null}

          <button type="submit" disabled={isSaving}>
            {isSaving ? "Criando perfil..." : "Criar perfil e continuar"}
          </button>
        </form>
      </section>
    </div>
  );
}
