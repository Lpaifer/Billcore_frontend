import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listCategories } from "../auth/categoriesApi";
import { getActiveFinancialProfileId } from "../auth/financialProfileStorage";
import { type PayableAccount, listPayableAccounts } from "../auth/payableAccountsApi";
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

export function PayableAccountsPage() {
  const [searchParams] = useSearchParams();
  const token = getAccessToken();
  const financialProfileId = getActiveFinancialProfileId();
  const [items, setItems] = useState<PayableAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});

  const createdSuccess = searchParams.get("created") === "1";
  const updatedSuccess = searchParams.get("updated") === "1";
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
        const [payables, categories] = await Promise.all([
          listPayableAccounts(token, financialProfileId),
          listCategories(token, financialProfileId)
        ]);

        if (active) {
          setItems(payables);
          const mapped = Object.fromEntries(categories.map((category) => [category.id, category.name]));
          setCategoryNames(mapped);
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

  const totalText = useMemo(() => `Total: ${items.length}`, [items.length]);

  return (
    <section className="board">
      <header className="board-header board-header-row">
        <div>
          <h1>Contas</h1>
          <p>{totalText}</p>
        </div>
        <Link className="primary-link-button" to="/payable-accounts/new">
          + Adicionar Conta
        </Link>
      </header>

      {createdSuccess ? <p className="board-success">Conta criada com sucesso.</p> : null}
      {updatedSuccess ? <p className="board-success">Conta atualizada com sucesso.</p> : null}

      {blockedByConfig ? <p className="board-warning">Perfil financeiro ativo nao encontrado.</p> : null}
      {error ? <p className="board-error">{error}</p> : null}

      <div className="table-wrap">
        <table className="payables-table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6}>Carregando contas...</td>
              </tr>
            ) : null}
            {!isLoading && items.length === 0 ? (
              <tr>
                <td colSpan={6}>Nenhuma conta encontrada.</td>
              </tr>
            ) : null}
            {!isLoading
              ? items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td>{categoryNames[item.categoryId] ?? "Categoria"}</td>
                    <td>{formatCurrency(item.originalAmount)}</td>
                    <td>{formatDate(item.dueDate)}</td>
                    <td>
                      <span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span>
                    </td>
                    <td>
                      <Link className="table-edit-link" to={`/payable-accounts/${item.id}/edit`}>
                        Edit
                      </Link>
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
