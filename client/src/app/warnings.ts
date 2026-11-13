import { Profile } from './simulation.service';
import { money } from './format';

export type Level = 'danger' | 'warn';
export interface Warning { level: Level; title: string; text: string; }

/** Early-warning rules. They look only at the profile, so no simulation is needed. */
export function computeWarnings(p: Profile): Warning[] {
  const out: Warning[] = [];
  const outgoing = p.spend + p.loan;
  const left = p.earn - outgoing;
  const runway = outgoing > 0 ? p.saved / outgoing : 99;
  const debtShare = p.earn > 0 ? p.loan / p.earn : (p.loan > 0 ? 1 : 0);

  if (p.saved <= 0) {
    out.push({ level: 'danger', title: 'No savings', text: 'You have no savings to fall back on. One bad month could push you into debt.' });
  } else if (runway < 3) {
    out.push({ level: 'danger', title: 'Very short safety net', text: 'Your savings cover only about ' + runway.toFixed(1) + ' months with no income. A common target is 3 to 6 months.' });
  } else if (runway < 6) {
    out.push({ level: 'warn', title: 'Thin safety net', text: 'Your savings cover about ' + runway.toFixed(1) + ' months with no income. A common target is 6 months.' });
  }

  if (left < 0) {
    out.push({ level: 'danger', title: 'Spending more than you earn', text: 'You are short by ' + money(-left) + ' every month, so your savings shrink even without a shock.' });
  }

  if (debtShare > 0.4) {
    out.push({ level: 'danger', title: 'Heavy loan payments', text: 'Loan payments take ' + Math.round(debtShare * 100) + '% of your income. A common guideline is to stay under about 40%.' });
  } else if (debtShare > 0.3) {
    out.push({ level: 'warn', title: 'Loan payments are getting high', text: 'They take ' + Math.round(debtShare * 100) + '% of your income. Watch this before taking on more debt.' });
  }
  return out;
}
