export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/** Redirecionamento interno usado apenas quando uma área protegida precisa abrir o painel. */
export const startLogin = () => {
  if (typeof window !== "undefined") window.location.href = "/admin";
};
