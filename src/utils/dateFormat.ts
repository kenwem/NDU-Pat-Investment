export function formatDateDDMMYYYY(dateInput: unknown): string {
  if (!dateInput) return new Date().toLocaleDateString('en-GB');
  if (typeof dateInput === 'string') {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateInput.trim())) {
      return dateInput.trim();
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
      const [y, m, d] = dateInput.trim().split('-');
      return `${d}/${m}/${y}`;
    }
    const parsed = new Date(dateInput);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-GB');
    }
    return dateInput;
  }
  if (
    typeof dateInput === 'object' &&
    dateInput !== null &&
    'toDate' in dateInput &&
    typeof (dateInput as { toDate: () => Date }).toDate === 'function'
  ) {
    return (dateInput as { toDate: () => Date }).toDate().toLocaleDateString('en-GB');
  }
  if (dateInput instanceof Date && !Number.isNaN(dateInput.getTime())) {
    return dateInput.toLocaleDateString('en-GB');
  }
  return new Date().toLocaleDateString('en-GB');
}

export function formatDateTimeDDMMYYYY(dateInput: unknown): string {
  let d: Date | null = null;
  if (!dateInput) return '';
  if (
    typeof dateInput === 'object' &&
    dateInput !== null &&
    'toDate' in dateInput &&
    typeof (dateInput as { toDate: () => Date }).toDate === 'function'
  ) {
    d = (dateInput as { toDate: () => Date }).toDate();
  } else if (dateInput instanceof Date) {
    d = dateInput;
  } else if (typeof dateInput === 'string') {
    const parsed = parseDateSafe(dateInput);
    if (parsed > 0) d = new Date(parsed);
    else return dateInput;
  }
  if (!d || Number.isNaN(d.getTime())) return '';
  const datePart = d.toLocaleDateString('en-GB');
  const timePart = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${datePart} ${timePart}`;
}

export function convertInputDateToDDMMYYYY(yyyyMmDd: string): string {
  if (!yyyyMmDd) return '';
  const parts = yyyyMmDd.split('-');
  if (parts.length !== 3) return yyyyMmDd;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function convertDDMMYYYYToInputDate(ddMmYyyy: string): string {
  if (!ddMmYyyy) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(ddMmYyyy)) return ddMmYyyy;
  const parts = ddMmYyyy.split('/');
  if (parts.length !== 3) return '';
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

export function parseDateSafe(val: unknown): number {
  if (!val) return 0;
  if (typeof val === 'object' && val !== null && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().getTime();
  }
  if (val instanceof Date) return val.getTime();
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const ddmmyyyy = val.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
    if (ddmmyyyy) {
      const [, dd, mm, yyyy, hh = '0', min = '0'] = ddmmyyyy;
      return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min)).getTime();
    }
    const parsed = Date.parse(val);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function formatNaira(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('₦')) return trimmed;
  return `₦${trimmed}`;
}

export function extractNumericPrice(priceStr: string | undefined): number {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : num;
}
