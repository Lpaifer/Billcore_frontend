import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NotificationsPage } from "./NotificationsPage";

describe("NotificationsPage", () => {
  beforeEach(() => {
    localStorage.setItem("billcore.access_token", "test-token");
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("updates unread counter when marking a notification as read", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              id: "n-1",
              title: "Conta vence amanha",
              message: "A conta \"Internet\" vence em 2026-05-01.",
              notificationType: "DUE_DATE",
              isRead: false,
              payableAccountId: "p-1",
              createdAt: "2026-04-27T10:00:00Z"
            }
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "n-1",
            title: "Conta vence amanha",
            message: "A conta \"Internet\" vence em 2026-05-01.",
            notificationType: "DUE_DATE",
            isRead: true,
            payableAccountId: "p-1",
            createdAt: "2026-04-27T10:00:00Z"
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );

    vi.stubGlobal("fetch", fetchMock);

    render(<NotificationsPage />);

    expect(await screen.findByText("Nao lidas: 1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Marcar como lida" }));

    await waitFor(() => {
      expect(screen.getByText("Nao lidas: 0")).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[0]).toContain("/api/v1/notifications/n-1/read");
  });
});
