export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

// Format number untuk input field (tanpa "Rp" prefix)
export function formatCurrencyInput(value: number | string): string {
  const numValue = typeof value === 'string' ? parseInt(value) || 0 : value;
  return new Intl.NumberFormat('id-ID').format(numValue);
}

// Parse currency input string ke number
export function parseCurrencyInput(value: string): number {
  // Remove all non-digit characters
  const cleaned = value.replace(/[^\d]/g, '');
  return cleaned === '' ? 0 : parseInt(cleaned);
}
