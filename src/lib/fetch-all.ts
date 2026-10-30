/** Reads every row past the database's 1,000-row page limit, one page at a time. */
export async function fetchAll<T>(page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>, size = 1000): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += size) {
    const r = await page(from, from + size - 1);
    if (r.error) throw r.error;
    const rows = r.data ?? [];
    out.push(...rows);
    if (rows.length < size) return out;
  }
}

/** Splits ids into small groups so bulk updates stay within request limits. */
export function chunk<T>(items: T[], size = 200): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
