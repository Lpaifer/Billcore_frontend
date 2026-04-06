import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listCategories, type CategoryOption } from "../auth/categoriesApi";
import { getActiveFinancialProfileId } from "../auth/financialProfileStorage";
import { createPayableAccount } from "../auth/payableAccountsApi";
import { getAccessToken } from "../auth/tokenStorage";

type CreateStatus = "PENDING" | "PAID";

export function AddPayableAccountPage() {
  const navigate = useNavigate();
  const token = getAccessToken();
  const financialProfileId = getActiveFinancialProfileId();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<CreateStatus>("PENDING");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const blockedByConfig = !token || !financialProfileId;

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      if (blockedByConfig) {
        setIsLoadingCategories(false);
        return;
      }

      try {
        const response = await listCategories(token, financialProfileId);
        if (!active) {
          return;
        }
        setCategories(response);
        setCategoryId(response[0]?.id ?? "");
      } catch (requestError) {
        if (!active) {
          return;
        }
        const message = requestError instanceof Error ? requestError.message : "Nao foi possivel carregar categorias.";
        setError(message);
      } finally {
        if (active) {
          setIsLoadingCategories(false);
        }
      }
    }

    void loadCategories();

    return () => {
      active = false;
    };
  }, [blockedByConfig, financialProfileId, token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (blockedByConfig) {
      setError("Configuracao ausente para salvar conta (token ou perfil financeiro).");
      return;
    }

    const parsedAmount = Number(amount);
    if (!description.trim() || !dueDate || Number.isNaN(parsedAmount) || parsedAmount <= 0 || !categoryId) {
      setError("Preencha os campos obrigatorios: fornecedor, valor, categoria e vencimento.");
      return;
    }

    setIsSaving(true);
    try {
      await createPayableAccount(token, financialProfileId, {
        description: description.trim(),
        originalAmount: parsedAmount,
        dueDate,
        categoryId,
        notes: notes.trim().length > 0 ? notes.trim() : undefined,
        status
      });
      navigate("/payable-accounts?created=1", { replace: true });
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Nao foi possivel criar a conta.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="board">
      <header className="board-header">
        <h1>Adicionar Conta</h1>
        <p>Preencha os dados da conta abaixo</p>
      </header>

      <form className="bill-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="vendor">Nome Fornecedor</label>
        <input
          id="vendor"
          type="text"
          placeholder="e.g. AWS, Adobe, Office Lease"
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
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="category">Categoria</label>
            <select
              id="category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={isLoadingCategories || categories.length === 0}
            >
              {categories.length === 0 ? <option value="">Selecione categoria</option> : null}
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
            <select id="status" value={status} onChange={(event) => setStatus(event.target.value as CreateStatus)}>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
          <div>
            <label htmlFor="recorrente">Recorrente</label>
            <input id="recorrente" type="text" value="One-time" disabled />
          </div>
        </div>

        <label htmlFor="notes">Notas</label>
        <textarea
          id="notes"
          placeholder="Notas adicionais"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
        />

        {blockedByConfig ? <p className="board-warning">Perfil financeiro ativo nao encontrado.</p> : null}
        {!blockedByConfig && !isLoadingCategories && categories.length === 0 ? (
          <p className="board-warning">Nenhuma categoria disponivel para este perfil.</p>
        ) : null}
        {error ? <p className="board-error">{error}</p> : null}

        <div className="bill-form-actions">
          <button
            className="primary"
            type="submit"
            disabled={isSaving || blockedByConfig || isLoadingCategories || categories.length === 0}
          >
            {isSaving ? "Criando..." : "Criar conta"}
          </button>
          <button type="button" onClick={() => navigate("/payable-accounts")}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
