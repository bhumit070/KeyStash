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
