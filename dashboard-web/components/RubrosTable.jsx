'use client';

import { useMemo } from 'react';
import DataTable from './DataTable';
import { colorPorCalificacion } from '../lib/colores';

export default function RubrosTable({ rubros }) {
  const columns = useMemo(
    () => [
      {
        key: 'nombre',
        label: 'Rubro',
        align: 'left',
        sortable: true,
        render: (r) => (
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {r.nombre}
          </span>
        ),
      },
      {
        key: 'primeraCal',
        label: 'Primera',
        align: 'center',
        sortable: true,
        render: (r) =>
          r.primeraCal == null ? (
            <span style={{ color: 'var(--text-tertiary)' }}>—</span>
          ) : (
            <span className="tabular-nums font-medium">{r.primeraCal.toFixed(1)}</span>
          ),
      },
      {
        key: 'ultimaCal',
        label: 'Actual',
        align: 'center',
        sortable: true,
        render: (r) => {
          if (r.ultimaCal == null) {
            return <span style={{ color: 'var(--text-tertiary)' }}>—</span>;
          }
          const color = colorPorCalificacion(Math.round(r.ultimaCal));
          return (
            <span
              className="inline-block min-w-[56px] px-3 py-0.5 rounded-full text-white font-bold tabular-nums text-sm"
              style={{
                backgroundColor: color,
                boxShadow: `0 0 12px -3px ${color}99`,
              }}
            >
              {r.ultimaCal.toFixed(1)}
            </span>
          );
        },
      },
      {
        key: 'promedio',
        label: 'Promedio',
        align: 'center',
        sortable: true,
        render: (r) => (
          <span className="tabular-nums font-medium">{r.promedio.toFixed(2)}</span>
        ),
      },
      {
        key: 'delta',
        label: 'Cambio',
        align: 'center',
        sortable: true,
        render: (r) => {
          if (r.delta == null) {
            return <span style={{ color: 'var(--text-tertiary)' }}>—</span>;
          }
          if (r.delta > 0) {
            return (
              <span className="font-bold tabular-nums" style={{ color: 'var(--eval-bueno)' }}>
                ▲ +{r.delta.toFixed(1)}
              </span>
            );
          }
          if (r.delta < 0) {
            return (
              <span className="font-bold tabular-nums" style={{ color: 'var(--eval-malo)' }}>
                ▼ {r.delta.toFixed(1)}
              </span>
            );
          }
          return (
            <span className="font-bold tabular-nums" style={{ color: 'var(--text-secondary)' }}>
              = 0.0
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      data={rubros}
      rowKey={(r) => r.id}
      searchPlaceholder="Buscar rubro…"
      searchKeys={['nombre']}
      pageSize={25}
      emptyMessage="No hay rubros disponibles."
    />
  );
}
