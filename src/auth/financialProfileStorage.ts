const ACTIVE_FINANCIAL_PROFILE_KEY = "billcore.active_financial_profile";
const ACTIVE_DEFAULT_CATEGORY_KEY = "billcore.active_default_category";

export function saveActiveFinancialProfileId(profileId: string): void {
  localStorage.setItem(ACTIVE_FINANCIAL_PROFILE_KEY, profileId);
}

export function getActiveFinancialProfileId(): string | null {
  return localStorage.getItem(ACTIVE_FINANCIAL_PROFILE_KEY);
}

export function clearActiveFinancialProfileId(): void {
  localStorage.removeItem(ACTIVE_FINANCIAL_PROFILE_KEY);
}

export function saveActiveDefaultCategoryId(categoryId: string | null): void {
  if (!categoryId) {
    localStorage.removeItem(ACTIVE_DEFAULT_CATEGORY_KEY);
    return;
  }
  localStorage.setItem(ACTIVE_DEFAULT_CATEGORY_KEY, categoryId);
}

export function getActiveDefaultCategoryId(): string | null {
  return localStorage.getItem(ACTIVE_DEFAULT_CATEGORY_KEY);
}

export function clearActiveDefaultCategoryId(): void {
  localStorage.removeItem(ACTIVE_DEFAULT_CATEGORY_KEY);
}
