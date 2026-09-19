import type { KeyItem } from './types';

function escapeCell(value: string): string {
  // Quote if the value contains a comma, quote, or newline; escape quotes.
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function itemsToCsv(items: KeyItem[]): string {
  const header = ['name', 'value', 'type', 'pinned', 'createdAt', 'updatedAt'];
  const rows = items.map((it) =>
    [
      it.name,
      it.value,
      it.type,
      String(it.pinned),
      new Date(it.createdAt).toISOString(),
      new Date(it.updatedAt).toISOString(),
    ]
      .map(escapeCell)
      .join(','),
  );
  return [header.join(','), ...rows].join('\r\n');
}

export function downloadCsv(items: KeyItem[], filename = 'keystash-export.csv'): void {
  const csv = itemsToCsv(items);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = '';
    } else if (char === '\n' && !inQuotes) {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
    } else if (char === '\r' && !inQuotes) {
      if (nextChar !== '\n') {
        currentCell += char;
      }
    } else {
      currentCell += char;
    }
  }
  
  if (currentCell !== '' || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }
  
  if (rows.length === 0) return [];
  
  const headers = rows[0].map(h => h.trim());
  const items = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 1 && row[0].trim() === '') continue; // Skip empty lines
    const item: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      item[headers[j]] = row[j] ?? '';
    }
    items.push(item);
  }
  
  return items;
}

