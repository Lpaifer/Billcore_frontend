import { NavLink, Outlet } from "react-router-dom";

export function AuthenticatedShell() {
  return (
    <div className="post-auth-shell">
      <aside className="side-nav">
        <div className="brand">BillCore</div>
        <nav className="side-nav-items">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
            Dashboard
          </NavLink>
          <NavLink to="/payable-accounts" className={({ isActive }) => (isActive ? "active" : "")}>
            Contas
          </NavLink>
          <NavLink to="/payable-accounts/new" className={({ isActive }) => (isActive ? "active" : "")}>
            Add Conta
          </NavLink>
        </nav>
      </aside>
      <main className="post-auth-content">
        <Outlet />
      </main>
    </div>
  );
}
