'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import DataTable from './DataTable';
import { colorPorCalificacion, formatearFecha } from '../lib/colores';
import { IconAntenna } from './ui/icons';

/**
 * Tabla de centros del dashboard (vista home).
 * Toda la lógica de filtros/sort/paginación vive en DataTable.
 */
export default function CentrosTable({ centros }) {
  const columns = useMemo(
    () => [
      {
        key: 'nombre',
        label: 'C.P.R.S.',
        align: 'left',
        sortable: true,
        render: (c) => (
          <Link
            href={`/cprs/${encodeURIComponent(c.nombre)}`}
            className="font-semibold hover:text-dorado-500 transition-colors inline-flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-dorado-500/80" />
            {c.nombre}
          </Link>
        ),
      },
      {
        key: 'totalSupervisiones',
        label: 'Supervisiones',
        align: 'center',
        sortable: true,
        render: (c) => (
          <span className="font-semibold tabular-nums">{c.totalSupervisiones}</span>
        ),
      },
      {
        key: 'ultimaFecha',
        label: 'Última',
        align: 'center',
        sortable: true,
        sortAccessor: (c) => (c.ultimaFecha ? new Date(c.ultimaFecha).getTime() : 0),
        render: (c) => (
          <span className="text-sm tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            {formatearFecha(c.ultimaFecha) || '—'}
          </span>
        ),
      },
      {
        key: 'estado',
        label: 'Estado',
        align: 'center',
        sortable: true,
        filterable: true,
        filterOptions: [
          { value: 'Pendiente', label: 'Pendiente' },
          { value: 'En riesgo', label: 'En riesgo' },
          { value: 'Aceptable', label: 'Aceptable' },
          { value: 'Óptimo', label: 'Óptimo' },
        ],
        render: (c) => {
          const v = c.estado;
          const tone =
            v === 'Óptimo'
              ? { bg: 'rgba(22,163,74,0.14)', fg: '#16a34a' }
              : v === 'Aceptable'
                ? { bg: 'rgba(202,138,4,0.14)', fg: '#ca8a04' }
                : v === 'En riesgo'
                  ? { bg: 'rgba(220,38,38,0.14)', fg: '#dc2626' }
                  : { bg: 'rgba(148,163,184,0.18)', fg: '#64748b' };
          return (
            <span
              className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: tone.bg, color: tone.fg }}
            >
              {v}
            </span>
          );
        },
      },
      {
        key: 'promedioActual',
        label: 'Promedio actual',
        align: 'center',
        sortable: true,
        render: (c) => {
          if (c.promedioActual == null) {
            return <span style={{ color: 'var(--text-tertiary)' }}>—</span>;
          }
          const color = colorPorCalificacion(Math.round(c.promedioActual));
          return (
            <span
              className="inline-block min-w-[68px] px-3.5 py-1 rounded-full text-white font-bold tabular-nums text-sm"
              style={{
                backgroundColor: color,
                boxShadow: `0 0 14px -2px ${color}88`,
              }}
            >
              {c.promedioActual.toFixed(2)}
            </span>
          );
        },
      },
      {
        key: 'delta',
        label: 'Tendencia',
        align: 'center',
        sortable: true,
        render: (c) => {
          if (c.delta == null) {
            return <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>—</span>;
          }
          if (c.delta > 0) {
            return (
              <span className="font-bold tabular-nums" style={{ color: 'var(--eval-bueno)' }}>
                ▲ +{c.delta.toFixed(2)}
              </span>
            );
          }
          if (c.delta < 0) {
            return (
              <span className="font-bold tabular-nums" style={{ color: 'var(--eval-malo)' }}>
                ▼ {c.delta.toFixed(2)}
              </span>
            );
          }
          return (
            <span className="font-bold tabular-nums" style={{ color: 'var(--text-secondary)' }}>
              = 0.00
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
      data={centros}
      rowKey={(c) => c.nombre}
      searchPlaceholder="Buscar centro…"
      searchKeys={['nombre', 'estado']}
      pageSize={25}
      emptyIcon={<IconAntenna width={42} height={42} />}
      emptyMessage="Aún no hay supervisiones finalizadas para mostrar."
    />
  );
}
