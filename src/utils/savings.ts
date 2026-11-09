import Decimal from "decimal.js";

export type SavingsYear = {
  year: number;
  deposits: number;
  interest: number;
  balance: number;
};

export type SavingsResult = {
  finalBalance: number;
  totalDeposits: number;
  totalInterest: number;
  years: SavingsYear[];
};

type Input = {
  initial: number;
  monthly: number;
  rate: number;
  years: number;
  mode: "compound" | "simple";
  timesPerYear: number;
};

export function calculateSavings(input: Input): SavingsResult | null {
  const { initial, monthly, rate, years, mode, timesPerYear } = input;
  const months = Math.round(years * 12);

  if (!(initial >= 0) || !(monthly >= 0) || initial + monthly <= 0) return null;
  if (!(rate >= 0) || rate > 100 || months < 1 || months > 720) return null;

  const r = new Decimal(rate).div(100);
  const rows: SavingsYear[] = [];

  if (mode === "simple") {
    const P = new Decimal(initial);
    for (let y = 1; y <= Math.ceil(months / 12); y++) {
      const t = Math.min(y * 12, months) / 12;
      const interest = P.mul(r).mul(t);
      rows.push({
        year: y,
        deposits: initial,
        interest: interest.toNumber(),
        balance: P.plus(interest).toNumber(),
      });
    }
    const last = rows[rows.length - 1];
    return {
      finalBalance: last.balance,
      totalDeposits: initial,
      totalInterest: last.interest,
      years: rows,
    };
  }

  const monthlyRate = r.div(12);
  const period = 12 / timesPerYear;
  let balance = new Decimal(initial);
  let accrued = new Decimal(0);
  let deposits = new Decimal(initial);

  for (let m = 1; m <= months; m++) {
    accrued = accrued.plus(balance.mul(monthlyRate));
    if (m % period === 0) {
      balance = balance.plus(accrued);
      accrued = new Decimal(0);
    }
    balance = balance.plus(monthly);
    deposits = deposits.plus(monthly);

    if (m % 12 === 0 || m === months) {
      const total = balance.plus(accrued);
      rows.push({
        year: Math.ceil(m / 12),
        deposits: deposits.toNumber(),
        interest: total.minus(deposits).toNumber(),
        balance: total.toNumber(),
      });
    }
  }

  const finalBalance = balance.plus(accrued);
  return {
    finalBalance: finalBalance.toNumber(),
    totalDeposits: deposits.toNumber(),
    totalInterest: finalBalance.minus(deposits).toNumber(),
    years: rows,
  };
}
