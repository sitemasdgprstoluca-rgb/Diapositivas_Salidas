'use client';

import { useMemo, useState } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * DataTable institucional adaptativo (light/dark via CSS vars).
 *
 * Props:
 *  - columns: [{ key, label, align?, render?(row,i)?, sortAccessor?(row), filterable?, filterOptions?, sortable? }]
 *  - data: array<row>
 *  - searchable: bool — search global (default true)
 *  - searchKeys: string[] — campos donde buscar (default = todas las keys)
 *  - searchPlaceholder
 *  - pageSize: number (default 25)
 *  - pageSizeOptions: number[] (default [10, 25, 50, 100])
 *  - emptyMessage: string | ReactNode
 *  - emptyIcon: ReactNode
 *  - rowKey: (row, i) => string
 *  - onRowClick?: (row) => void
 *  - className: string
 */
export default function DataTable({
  columns,
  data,
  searchable = true,
  searchKeys,
  searchPlaceholder = 'Buscar…',
  pageSize: initialPageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  emptyMessage = 'Sin datos para mostrar',
  emptyIcon = null,
  rowKey,
  onRowClick,
  className = '',
}) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: null, dir: 'asc' });
  const [filters, setFilters] = useState({}); // { [colKey]: 'value' | '' }
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Resolve key → value (admite "a.b.c")
  const resolve = (row, key) =>
    String(key)
      .split('.')
      .reduce((acc, k) => (acc != null ? acc[k] : undefined), row);

  // Aplica filtros + search
  const filtered = useMemo(() => {
    const keys = searchKeys?.length ? searchKeys : columns.map((c) => c.key);
    return data.filter((row) => {
      // Filtros por columna
      for (const colKey of Object.keys(filters)) {
        const fval = filters[colKey];
        if (!fval) continue;
        const cell = String(resolve(row, colKey) ?? '').toLowerCase();
        if (cell !== String(fval).toLowerCase()) return false;
      }
      // Search global
      if (search) {
        const q = search.toLowerCase();
        const hit = keys.some((k) => String(resolve(row, k) ?? '').toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    });
  }, [data, search, filters, columns, searchKeys]);

  // Sort
  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    const accessor = col?.sortAccessor || ((row) => resolve(row, sort.key));
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = accessor(a);
      const vb = accessor(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return sort.dir === 'asc' ? va - vb : vb - va;
      }
      return sort.dir === 'asc'
        ? String(va).localeCompare(String(vb), 'es', { numeric: true })
        : String(vb).localeCompare(String(va), 'es', { numeric: true });
    });
    return arr;
  }, [filtered, sort, columns]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageRows = sorted.slice(pageStart, pageStart + pageSize);

  const toggleSort = (key, sortable = true) => {
    if (!sortable) return;
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
    setPage(1);
  };

  const setFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  // Auto-derive filterOptions si no se proveen
  const optionsFor = (col) => {
    if (col.filterOptions) return col.filterOptions;
    const set = new Set();
    for (const row of data) {
      const v = resolve(row, col.key);
      if (v != null && v !== '') set.add(String(v));
    }
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
      .map((v) => ({ value: v, label: v }));
  };

  const columnasFiltrables = columns.filter((c) => c.filterable);
  const algunFiltro =
    !!search ||
    Object.values(filters).some(Boolean);

  const limpiarTodo = () => {
    setSearch('');
    setFilters({});
    setPage(1);
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Toolbar */}
      {(searchable || columnasFiltrables.length > 0) && (
        <div className="flex flex-wrap items-center gap-3">
          {searchable && (
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
                <Search size={15} strokeWidth={2.4} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-dorado-500/40 transition"
                style={{
                  background: 'var(--bg-muted)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-subtle)',
                }}
              />
            </div>
          )}

          {columnasFiltrables.map((col) => {
            const opts = optionsFor(col);
            return (
              <select
                key={col.key}
                value={filters[col.key] || ''}
                onChange={(e) => setFilter(col.key, e.target.value)}
                className="text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dorado-500/40 transition"
                style={{
                  background: 'var(--bg-muted)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-subtle)',
                }}
                aria-label={`Filtrar por ${col.label}`}
              >
                <option value="">Todos · {col.label}</option>
                {opts.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            );
          })}

          {algunFiltro && (
            <button
              type="button"
              onClick={limpiarTodo}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition"
              style={{
                color: 'var(--text-secondary)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <X size={13} strokeWidth={2.4} /> Limpiar
            </button>
          )}

          <span
            className="text-xs tabular-nums ml-auto"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {sorted.length} {sorted.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr
              className="border-b"
              style={{
                borderColor: 'var(--border-subtle)',
                background: 'var(--bg-muted)',
              }}
            >
              {columns.map((col) => {
                const isSorted = sort.key === col.key;
                const sortable = col.sortable !== false;
                return (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key, sortable)}
                    className={`px-4 py-3 text-[10.5px] font-bold uppercase tracking-[0.16em] select-none ${
                      sortable ? 'cursor-pointer' : ''
                    } ${
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                    }`}
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span className={`inline-flex items-center gap-1.5 ${
                      col.align === 'center' ? 'justify-center w-full' : col.align === 'right' ? 'justify-end w-full' : ''
                    }`}>
                      {col.label}
                      {sortable && (
                        isSorted
                          ? sort.dir === 'asc'
                            ? <ArrowUp size={11} strokeWidth={2.6} className="text-dorado-500" />
                            : <ArrowDown size={11} strokeWidth={2.6} className="text-dorado-500" />
                          : <ArrowUpDown size={11} strokeWidth={2} className="opacity-40" />
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  {emptyIcon && <div className="mb-3 flex justify-center opacity-60">{emptyIcon}</div>}
                  <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {emptyMessage}
                  </p>
                  {algunFiltro && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      Prueba a limpiar los filtros para ver todos los registros.
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              pageRows.map((row, i) => {
                const k = rowKey ? rowKey(row, pageStart + i) : `r-${pageStart + i}`;
                const clickable = !!onRowClick;
                return (
                  <tr
                    key={k}
                    onClick={clickable ? () => onRowClick(row) : undefined}
                    className={`border-b transition-colors ${clickable ? 'cursor-pointer' : ''}`}
                    style={{
                      borderColor: 'var(--border-subtle)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--hover-bg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {columns.map((col) => {
                      const align =
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                            ? 'text-right'
                            : 'text-left';
                      const v = resolve(row, col.key);
                      return (
                        <td key={col.key} className={`px-4 py-3 ${align}`} style={{ color: 'var(--text-primary)' }}>
                          {col.render ? col.render(row, pageStart + i) : v ?? '—'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {sorted.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>Filas por página:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 rounded border text-xs"
              style={{
                background: 'var(--bg-muted)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="tabular-nums ml-2">
              {sorted.length === 0
                ? '0–0'
                : `${pageStart + 1}–${Math.min(pageStart + pageSize, sorted.length)} de ${sorted.length}`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md border text-xs disabled:opacity-30 transition"
              style={{
                background: 'var(--bg-muted)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-subtle)',
              }}
              aria-label="Página anterior"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs px-2 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
              Página <strong style={{ color: 'var(--text-primary)' }}>{safePage}</strong> de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md border text-xs disabled:opacity-30 transition"
              style={{
                background: 'var(--bg-muted)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-subtle)',
              }}
              aria-label="Página siguiente"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
