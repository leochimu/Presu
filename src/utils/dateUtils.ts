/**
 * Date utility functions for consistent date formatting across the app:
 * Form inputs (<input type="date" />), PDF documents, preview cards, and sharing.
 */

/**
 * Normalizes any date string into 'YYYY-MM-DD' suitable for HTML <input type="date" />.
 */
export function formatDateForInput(dateStr?: string): string {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const trimmed = dateStr.trim();
  if (!trimmed) return '';

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Format DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // If ISO timestamp like 2026-09-22T...
  if (trimmed.includes('T')) {
    const datePart = trimmed.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return datePart;
    }
  }

  // Attempt standard Date parsing
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    try {
      return parsed.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  return '';
}

/**
 * Formats a date string for user-facing display in Latin America / Spain (DD/MM/YYYY).
 * Ensures both 'Fecha de emisión' and 'Fecha de vigencia/validez' share the exact same format.
 */
export function formatDisplayDate(dateStr?: string, fallback: string = ''): string {
  if (!dateStr || typeof dateStr !== 'string') return fallback;
  const trimmed = dateStr.trim();
  if (!trimmed) return fallback;

  // If YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split('-');
    return `${day}/${month}/${year}`;
  }

  // If ISO timestamp with T
  if (trimmed.includes('T')) {
    const datePart = trimmed.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year}`;
    }
  }

  // If already DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${day}/${month}/${year}`;
  }

  return trimmed;
}

/**
 * Calculates a default validity date offset from an emission date.
 * Default is +15 days.
 */
export function addDaysToDate(baseDateStr?: string, days: number = 15): string {
  const normalized = formatDateForInput(baseDateStr) || new Date().toISOString().split('T')[0];
  const [year, month, day] = normalized.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
