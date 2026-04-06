export interface CategoryOption {
  id: string;
  label: string;
}

const DEFAULT_API_BASE_URL = "http://localhost:8080";

function parseCategoryOptions(raw: string | undefined): CategoryOption[] {
  if (!raw || raw.trim().length === 0) {
    return [];
  }

  return raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0)
    .map((entry) => {
      const [idPart, labelPart] = entry.split(":");
      const id = idPart?.trim() ?? "";
      const label = labelPart?.trim() ?? "";

      return {
        id,
        label: label.length > 0 ? label : id
      };
    })
    .filter((option) => option.id.length > 0);
}

export function apiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

export function activeFinancialProfileId(): string | null {
  const value = import.meta.env.VITE_FINANCIAL_PROFILE_ID;
  return value && value.trim().length > 0 ? value.trim() : null;
}

export function configuredCategoryOptions(): CategoryOption[] {
  const fromOptions = parseCategoryOptions(import.meta.env.VITE_CATEGORY_OPTIONS);
  if (fromOptions.length > 0) {
    return fromOptions;
  }

  const defaultCategoryId = import.meta.env.VITE_DEFAULT_CATEGORY_ID;
  if (!defaultCategoryId || defaultCategoryId.trim().length === 0) {
    return [];
  }

  return [
    {
      id: defaultCategoryId.trim(),
      label: "Categoria padrão"
    }
  ];
}
