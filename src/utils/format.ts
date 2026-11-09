const addCommas = (int: string) => int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export function formatNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "–";
  const [int, dec] = Math.abs(value).toFixed(decimals).split(".");
  const out = dec ? `${addCommas(int)}.${dec}` : addCommas(int);
  return value < 0 ? `-${out}` : out;
}

export function formatMoney(
  value: number,
  symbol: string,
  decimals = 2,
): string {
  return `${symbol} ${formatNumber(value, decimals)}`;
}

export function formatInputDisplay(raw: string): string {
  if (!raw) return "";
  const [int, dec] = raw.split(".");
  return dec !== undefined ? `${addCommas(int)}.${dec}` : addCommas(int);
}

export function sanitizeNumberInput(
  text: string,
  allowNegative = false,
): string {
  const negative = allowNegative && text.trim().startsWith("-");
  let t = text.replace(/[^0-9.]/g, "");
  const parts = t.split(".");
  if (parts.length > 2) t = `${parts[0]}.${parts.slice(1).join("")}`;
  return negative ? `-${t}` : t;
}

export function formatSmart(value: number, maxDecimals = 2): string {
  const out = formatNumber(value, maxDecimals);
  return out.includes(".") ? out.replace(/\.?0+$/, "") : out;
}

export function formatUnitValue(value: number): string {
  if (!Number.isFinite(value)) return "–";
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 1e12 || abs < 1e-6)) return value.toExponential(4);
  return formatSmart(Number(value.toPrecision(12)), 6);
}
