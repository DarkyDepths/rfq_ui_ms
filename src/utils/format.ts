const sarFormatter = new Intl.NumberFormat("en-SA", {
  style: "currency",
  currency: "SAR",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number) {
  return sarFormatter.format(value);
}

export function formatCompactCurrency(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M SAR`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K SAR`;
  }

  return `${value} SAR`;
}

export function formatDate(isoDate?: string) {
  if (!isoDate) {
    return "Pending";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}
