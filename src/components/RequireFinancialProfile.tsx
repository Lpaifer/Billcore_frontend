import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { listFinancialProfiles } from "../auth/financialProfileApi";
import {
  getActiveDefaultCategoryId,
  getActiveFinancialProfileId,
  saveActiveDefaultCategoryId,
  saveActiveFinancialProfileId
} from "../auth/financialProfileStorage";
import { getAccessToken } from "../auth/tokenStorage";

export function RequireFinancialProfile() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [mustOnboard, setMustOnboard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfiles() {
      const token = getAccessToken();
      if (!token) {
        if (active) {
          setMustOnboard(true);
          setIsLoading(false);
        }
        return;
      }

      const existingProfileId = getActiveFinancialProfileId();
      const existingCategoryId = getActiveDefaultCategoryId();
      if (existingProfileId && existingCategoryId) {
        if (active) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const profiles = await listFinancialProfiles(token);
        if (!active) {
          return;
        }

        if (profiles.length === 0) {
          setMustOnboard(true);
          setIsLoading(false);
          return;
        }

        const selected = profiles[0];
        saveActiveFinancialProfileId(selected.id);
        saveActiveDefaultCategoryId(selected.defaultCategoryId);
        setIsLoading(false);
      } catch (requestError) {
        if (!active) {
          return;
        }
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível validar perfil financeiro.";
        setError(message);
        setIsLoading(false);
      }
    }

    void loadProfiles();

    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return <div className="guard-screen">Carregando ambiente financeiro...</div>;
  }

  if (error) {
    return <div className="guard-screen guard-error">{error}</div>;
  }

  if (mustOnboard) {
    return <Navigate to="/onboarding/financial-profile" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
