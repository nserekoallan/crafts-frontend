/**
 * Exports tabular data as a CSV file download.
 * Cells are double-quote escaped; quotes inside values are doubled.
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
): void {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [
    headers.map(escape).join(','),
    ...rows.map((r) => r.map(escape).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
