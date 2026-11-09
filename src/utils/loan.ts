import Decimal from "decimal.js";

export type YearRow = {
  year: number;
  principal: number;
  interest: number;
  balance: number;
};

export type LoanResult = {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  years: YearRow[];
};

export function calculateLoan(
  principal: number,
  annualRate: number,
  months: number,
): LoanResult | null {
  if (!(principal > 0) || !(months >= 1) || months > 600) return null;
  if (!(annualRate >= 0) || annualRate > 100) return null;

  const P = new Decimal(principal);
  const r = new Decimal(annualRate).div(12).div(100);

  let emi: Decimal;
  if (r.isZero()) {
    emi = P.div(months);
  } else {
    const pow = r.plus(1).pow(months);
    emi = P.mul(r).mul(pow).div(pow.minus(1));
  }

  const totalPayment = emi.mul(months);
  const totalInterest = totalPayment.minus(P);

  // Year-by-year schedule
  const years: YearRow[] = [];
  let balance = P;
  let yearPrincipal = new Decimal(0);
  let yearInterest = new Decimal(0);

  for (let m = 1; m <= months; m++) {
    const interest = balance.mul(r);
    const principalPart = m === months ? balance : emi.minus(interest);
    balance = balance.minus(principalPart);
    yearPrincipal = yearPrincipal.plus(principalPart);
    yearInterest = yearInterest.plus(interest);

    if (m % 12 === 0 || m === months) {
      years.push({
        year: Math.ceil(m / 12),
        principal: yearPrincipal.toNumber(),
        interest: yearInterest.toNumber(),
        balance: Decimal.max(balance, 0).toNumber(),
      });
      yearPrincipal = new Decimal(0);
      yearInterest = new Decimal(0);
    }
  }

  return {
    emi: emi.toNumber(),
    totalPayment: totalPayment.toNumber(),
    totalInterest: totalInterest.toNumber(),
    principal,
    years,
  };
}
