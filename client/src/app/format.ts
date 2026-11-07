export const money = (n: number): string =>
  (n < 0 ? '−' : '') + '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.abs(Math.round(n)));

export const short = (n: number): string => {
  const a = Math.abs(n), s = n < 0 ? '−' : '';
  return a >= 1e5 ? s + '₹' + (a / 1e5).toFixed(1).replace(/\.0$/, '') + 'L' : s + '₹' + Math.round(a / 1e3) + 'k';
};
