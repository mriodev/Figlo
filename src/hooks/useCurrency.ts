import { useAppStore } from "../store/useAppStore";
import { CURRENCY_SYMBOL } from "../utils/currency";

export function useCurrency(): string {
  const custom = useAppStore((s) => s.currency);
  return custom || CURRENCY_SYMBOL;
}
