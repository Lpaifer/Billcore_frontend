import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listCategories, type CategoryOption } from "../auth/categoriesApi";
import { getActiveFinancialProfileId } from "../auth/financialProfileStorage";
import {
  type PayableAccount,
  listPayableAccounts,
  updatePayableAccount
} from "../auth/payableAccountsApi";
import { getAccessToken } from "../auth/tokenStorage";

type EditableStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELED";

export function EditPayableAccountPage() {
  const navigate = useNavigate();
  const { payableAccountId } = useParams();
  const token = getAccessToken();
  const financialProfileId = getActiveFinancialProfileId();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<EditableStatus>("PENDING");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const blockedByConfig = !token || !financialProfileId || !payableAccountId;

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
        const [payables, categoryList] = await Promise.all([
          listPayableAccounts(token, financialProfileId),
          listCategories(token, financialProfileId)
        ]);
        if (!active) {
          return;
        }

        const target = payables.find((item) => item.id === payableAccountId);
        if (!target) {
          setError("Conta não encontrada para edição.");
          setIsLoading(false);
          return;
        }

        hydrateForm(target, categoryList);
      } catch (requestError) {
        if (!active) {
          return;
        }
        const message =
          requestError instanceof Error ? requestError.message : "Não foi possível carregar conta para edição.";
        setError(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    function hydrateForm(target: PayableAccount, categoryList: CategoryOption[]) {
      setCategories(categoryList);
      setDescription(target.description);
      setAmount(String(target.originalAmount));
      setDueDate(target.dueDate);
      setNotes(target.notes ?? "");
      setStatus(target.status);
      setCategoryId(target.categoryId);
    }

    void load();

    return () => {
      active = false;
    };
  }, [blockedByConfig, financialProfileId, payableAccountId, token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (blockedByConfig) {
      setError("Configuração ausente para editar conta.");
      return;
    }

    const parsedAmount = Number(amount);
    if (!description.trim() || !dueDate || Number.isNaN(parsedAmount) || parsedAmount <= 0 || !categoryId) {
      setError("Preencha os campos obrigatórios: fornecedor, valor, categoria e vencimento.");
      return;
    }

    setIsSaving(true);
    try {
      await updatePayableAccount(token, payableAccountId, {
        description: description.trim(),
        originalAmount: parsedAmount,
        dueDate,
        categoryId,
        notes: notes.trim().length > 0 ? notes.trim() : undefined,
        status
      });
      navigate("/payable-accounts?updated=1", { replace: true });
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Não foi possível atualizar a conta.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <section className="board">Carregando conta para edição...</section>;
  }

  return (
    <section className="board">
      <header className="board-header">
        <h1>Editar Conta</h1>
        <p>Altere os dados da conta</p>
      </header>

      <form className="bill-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="vendor">Nome Fornecedor</label>
        <input
          id="vendor"
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <div className="bill-form-grid">
          <div>
            <label htmlFor="amount">Valor ($)</label>
            <input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="category">Categoria</label>
            <select id="category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="dueDate">Data de Vencimento</label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value as EditableStatus)}
            >
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="OVERDUE">OVERDUE</option>
              <option value="CANCELED">CANCELED</option>
            </select>
          </div>
        </div>

        <label htmlFor="notes">Notas</label>
        <textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} />

        {blockedByConfig ? <p className="board-warning">Perfil financeiro ativo não encontrado.</p> : null}
        {error ? <p className="board-error">{error}</p> : null}

        <div className="bill-form-actions">
          <button className="primary" type="submit" disabled={isSaving || blockedByConfig}>
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </button>
          <button type="button" onClick={() => navigate("/payable-accounts")}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
