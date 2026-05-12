import { type FormEvent, useEffect, useState } from "react";
import { createCategory, listCategories, type CategoryOption } from "../auth/categoriesApi";
import {
  clearActiveDefaultCategoryId,
  clearActiveFinancialProfileId,
  getActiveFinancialProfileId
} from "../auth/financialProfileStorage";
import { listPayableAccounts } from "../auth/payableAccountsApi";
import { clearAccessToken, getAccessToken } from "../auth/tokenStorage";
import { useNavigate } from "react-router-dom";

export function CategoriesPage() {
  const navigate = useNavigate();
  const token = getAccessToken();
  const financialProfileId = getActiveFinancialProfileId();
  const [items, setItems] = useState<CategoryOption[]>([]);
  const [categoryUsageCount, setCategoryUsageCount] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
        const [categories, payableAccounts] = await Promise.all([
          listCategories(token, financialProfileId),
          listPayableAccounts(token, financialProfileId)
        ]);
        if (active) {
          setItems(categories);
          const usage = payableAccounts.reduce<Record<string, number>>((acc, account) => {
            acc[account.categoryId] = (acc[account.categoryId] ?? 0) + 1;
            return acc;
          }, {});
          setCategoryUsageCount(usage);
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        const message = requestError instanceof Error ? requestError.message : "Nao foi possivel carregar categorias.";
        if (message === "AUTH_UNAUTHORIZED") {
          clearAccessToken();
          clearActiveFinancialProfileId();
          clearActiveDefaultCategoryId();
          navigate("/login", { replace: true });
          return;
        }
        setError(message);
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
  }, [blockedByConfig, financialProfileId, navigate, token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);

    if (blockedByConfig) {
      setError("Perfil financeiro ativo nao encontrado.");
      return;
    }

    if (!name.trim()) {
      setError("Informe o nome da categoria.");
      return;
    }

    setIsSaving(true);
    try {
      const created = await createCategory(token, financialProfileId, { name: name.trim() });
      setItems((current) => [...current, created]);
      setCategoryUsageCount((current) => ({ ...current, [created.id]: 0 }));
      setName("");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Nao foi possivel criar categoria.";
      if (message === "AUTH_UNAUTHORIZED" || message === "Unauthorized") {
        clearAccessToken();
        clearActiveFinancialProfileId();
        clearActiveDefaultCategoryId();
        navigate("/login", { replace: true });
        return;
      }
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="board">
      <header className="board-header">
        <h1>Categorias</h1>
        <p>Crie e gerencie categorias do seu perfil financeiro.</p>
      </header>

      <form className="filters-card" onSubmit={handleSubmit}>
        <div className="filters-grid">
          <div>
            <label htmlFor="category-name">Nome da categoria</label>
            <input
              id="category-name"
              type="text"
              value={name}
              maxLength={100}
              placeholder="Ex.: Moradia, Alimentacao, Transporte"
              onChange={(event) => setName(event.target.value)}
            />
          </div>
        </div>
        <div className="filters-actions">
          <button type="submit" disabled={isSaving || blockedByConfig}>
            {isSaving ? "Salvando..." : "Criar categoria"}
          </button>
        </div>
      </form>

      {blockedByConfig ? <p className="board-warning">Perfil financeiro ativo nao encontrado.</p> : null}
      {error ? <p className="board-error">{error}</p> : null}

      <div className="table-wrap">
        <table className="payables-table">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Contas vinculadas</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={2}>Carregando categorias...</td>
              </tr>
            ) : null}
            {!isLoading && items.length === 0 ? (
              <tr>
                <td colSpan={2}>Nenhuma categoria cadastrada.</td>
              </tr>
            ) : null}
            {!isLoading
              ? items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{categoryUsageCount[item.id] ?? 0}</td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
