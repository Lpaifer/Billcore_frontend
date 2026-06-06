import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DashboardPage } from "./DashboardPage";

describe("DashboardPage", () => {
  beforeEach(() => {
    localStorage.setItem("billcore.access_token", "test-token");
    localStorage.setItem("billcore.active_financial_profile", "profile-1");
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders dashboard analytics from API", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          financialProfileId: "profile-1",
          statusSummary: {
            pendingCount: 1,
            overdueCount: 1,
            paidCount: 1,
            canceledCount: 0
          },
          amountSummary: {
            openAmount: 600,
            overdueAmount: 500,
            paidAmount: 200,
            dueSoonAmount: 100
          },
          categorySummary: [
            {
              categoryId: "cat-1",
              categoryName: "Moradia",
              amount: 600,
              count: 2
            }
          ],
          urgentAccounts: [
            {
              id: "acc-1",
              description: "Aluguel",
              dueDate: "2026-06-01",
              status: "OVERDUE",
              originalAmount: 500,
              categoryName: "Moradia"
            }
          ]
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Total em aberto")).toBeInTheDocument();
    expect(screen.getByText("Total vencido")).toBeInTheDocument();
    expect(screen.getByText("Por categoria")).toBeInTheDocument();
    expect(screen.getByText("Moradia")).toBeInTheDocument();
    expect(screen.getByText("Aluguel")).toBeInTheDocument();
    expect(screen.getByText("Vencida")).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/financial-profiles/profile-1/dashboard"),
        expect.objectContaining({
          method: "GET",
          headers: {
            Authorization: "Bearer test-token"
          }
        })
      );
    });
  });

  it("shows empty state when profile has no accounts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            financialProfileId: "profile-1",
            statusSummary: {
              pendingCount: 0,
              overdueCount: 0,
              paidCount: 0,
              canceledCount: 0
            },
            amountSummary: {
              openAmount: 0,
              overdueAmount: 0,
              paidAmount: 0,
              dueSoonAmount: 0
            },
            categorySummary: [],
            urgentAccounts: []
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Nenhuma conta cadastrada ainda.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Adicionar conta" })).toHaveAttribute("href", "/payable-accounts/new");
  });
});
