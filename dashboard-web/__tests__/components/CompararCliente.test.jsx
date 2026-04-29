/**
 * Tests de integración del componente CompararCliente.
 *
 * Verifican:
 *  - Selección por default (toma los primeros min(3, disponibles))
 *  - Toggle de centros (agrega/quita)
 *  - Límite de 7 centros simultáneos
 *  - Mensaje vacío cuando no hay selección
 *  - Los 4 componentes hijos reciben las props correctas
 *  - KPIs reflejan el estado actual
 *
 * Estrategia: mockeamos los 4 componentes hijos (RadarComparativo,
 * EvolucionConPrediccion, RankingGeneral, InsightsIA) para evitar
 * renderizar Recharts (depende de SVG y dimensiones, costoso en jsdom).
 * Cada mock expone los props recibidos vía data-attributes para inspección.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import CompararCliente from '@/components/CompararCliente';

// ─── Mocks de hijos analytics ───
vi.mock('@/components/analytics/RadarComparativo', () => ({
  default: ({ datos, centros }) => (
    <div
      data-testid="radar-mock"
      data-num-rubros={datos?.length ?? 0}
      data-centros={centros?.join(',') ?? ''}
    />
  ),
}));

vi.mock('@/components/analytics/EvolucionConPrediccion', () => ({
  default: ({ datos, centros }) => (
    <div
      data-testid="evolucion-mock"
      data-num-rows={datos?.length ?? 0}
      data-centros={centros?.join(',') ?? ''}
    />
  ),
}));

vi.mock('@/components/analytics/RankingGeneral', () => ({
  default: ({ centros }) => (
    <div
      data-testid="ranking-mock"
      data-num-centros={centros?.length ?? 0}
      data-orden={centros?.map((c) => c.nombre).join(',') ?? ''}
    />
  ),
}));

vi.mock('@/components/analytics/InsightsIA', () => ({
  default: ({ insights }) => (
    <div
      data-testid="insights-mock"
      data-num-insights={insights?.length ?? 0}
      data-tipos={insights?.map((i) => i.tipo).join(',') ?? ''}
    />
  ),
}));

// ─── Helpers para construir datos sintéticos ───
const makeSup = (id, nombre_cprs, fecha, promedio_general) => ({
  id,
  nombre_cprs,
  fecha_hora_supervision: fecha,
  promedio_general,
  estado: 'finalizado',
});

const makeRubro = (rubro_catalog_id, nombre, orden, calificacion) => ({
  id: `r-${rubro_catalog_id}-${Math.random()}`,
  rubro_catalog_id,
  nombre,
  orden,
  calificacion,
  no_aplica: false,
});

describe('CompararCliente — integración', () => {
  it('renderiza KPIs y selector con la lista de centros disponibles', () => {
    const centros = ['CHALCO', 'ECATEPEC', 'TLALNEPANTLA'];
    render(
      <CompararCliente
        centrosDisponibles={centros}
        todasSups={[]}
        rubrosPorSup={{}}
      />
    );

    // Los 3 centros aparecen como botones
    centros.forEach((c) => {
      expect(screen.getByRole('button', { name: new RegExp(c) })).toBeInTheDocument();
    });

    // KPIs visibles
    expect(screen.getByText(/Centros seleccionados/i)).toBeInTheDocument();
    expect(screen.getByText(/Rubros analizados/i)).toBeInTheDocument();
    expect(screen.getByText(/Supervisiones/i)).toBeInTheDocument();
    expect(screen.getByText(/Insights IA/i)).toBeInTheDocument();
  });

  it('por default selecciona los primeros min(3, disponibles)', () => {
    const centros = ['A', 'B', 'C', 'D', 'E'];
    render(
      <CompararCliente
        centrosDisponibles={centros}
        todasSups={[]}
        rubrosPorSup={{}}
      />
    );

    // El KPI "Centros seleccionados" muestra "3/5"
    expect(screen.getByText('3/5')).toBeInTheDocument();

    // El radar y evolución muestran los primeros 3 como activos
    const radar = screen.getByTestId('radar-mock');
    expect(radar.dataset.centros).toBe('A,B,C');
  });

  it('si solo hay 1 centro disponible, selecciona 1 por default', () => {
    render(
      <CompararCliente
        centrosDisponibles={['UNICO']}
        todasSups={[]}
        rubrosPorSup={{}}
      />
    );
    const radar = screen.getByTestId('radar-mock');
    expect(radar.dataset.centros).toBe('UNICO');
  });

  it('toggle: click en un centro seleccionado lo deselecciona', () => {
    const centros = ['A', 'B'];
    render(
      <CompararCliente
        centrosDisponibles={centros}
        todasSups={[]}
        rubrosPorSup={{}}
      />
    );

    // Initially A,B are selected (2 disponibles, min(3,2)=2)
    let radar = screen.getByTestId('radar-mock');
    expect(radar.dataset.centros).toBe('A,B');

    // Click en A para deseleccionar
    const btnA = screen.getByRole('button', { name: /A/ });
    fireEvent.click(btnA);

    radar = screen.getByTestId('radar-mock');
    expect(radar.dataset.centros).toBe('B');
  });

  it('toggle: click en un centro no seleccionado lo agrega', () => {
    const centros = ['A', 'B', 'C', 'D'];
    render(
      <CompararCliente
        centrosDisponibles={centros}
        todasSups={[]}
        rubrosPorSup={{}}
      />
    );

    // Default: A,B,C
    let radar = screen.getByTestId('radar-mock');
    expect(radar.dataset.centros).toBe('A,B,C');

    fireEvent.click(screen.getByRole('button', { name: /D/ }));

    radar = screen.getByTestId('radar-mock');
    expect(radar.dataset.centros).toBe('A,B,C,D');
  });

  it('límite duro de 7 centros: el 8vo click no agrega', () => {
    const centros = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    render(
      <CompararCliente
        centrosDisponibles={centros}
        todasSups={[]}
        rubrosPorSup={{}}
      />
    );

    // Default: A,B,C (3)
    // Agregar D, E, F, G → 7 total
    ['D', 'E', 'F', 'G'].forEach((c) => {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${c}$|^●  ${c}$`) }));
    });

    // Confirmar 7
    let radar = screen.getByTestId('radar-mock');
    expect(radar.dataset.centros.split(',')).toHaveLength(7);

    // Intentar agregar H (el 8vo)
    fireEvent.click(screen.getByRole('button', { name: /^H$/ }));

    // Sigue en 7
    radar = screen.getByTestId('radar-mock');
    expect(radar.dataset.centros.split(',')).toHaveLength(7);
    expect(radar.dataset.centros).not.toContain('H');
  });

  it('al deseleccionar todos, muestra mensaje "Selecciona al menos un centro"', () => {
    const centros = ['A'];
    render(
      <CompararCliente
        centrosDisponibles={centros}
        todasSups={[]}
        rubrosPorSup={{}}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /A/ }));

    expect(screen.getByText(/Selecciona al menos un centro/i)).toBeInTheDocument();

    // Los componentes hijos analytics no se renderizan
    expect(screen.queryByTestId('radar-mock')).not.toBeInTheDocument();
    expect(screen.queryByTestId('evolucion-mock')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ranking-mock')).not.toBeInTheDocument();
    expect(screen.queryByTestId('insights-mock')).not.toBeInTheDocument();
  });

  it('Ranking recibe centros ordenados por promedio descendente', () => {
    const todasSups = [
      makeSup('1', 'A', '2026-01-01', 6),
      makeSup('2', 'A', '2026-02-01', 7),
      makeSup('3', 'B', '2026-01-01', 5),
      makeSup('4', 'B', '2026-02-01', 9),
      makeSup('5', 'C', '2026-01-01', 8),
    ];
    render(
      <CompararCliente
        centrosDisponibles={['A', 'B', 'C']}
        todasSups={todasSups}
        rubrosPorSup={{}}
      />
    );

    const ranking = screen.getByTestId('ranking-mock');
    // últimos: A=7, B=9, C=8 → orden esperado: B, C, A
    expect(ranking.dataset.orden).toBe('B,C,A');
  });

  it('Radar recibe los rubros agregados de la última supervisión de cada centro', () => {
    const todasSups = [
      makeSup('a-old', 'A', '2026-01-01', 6),
      makeSup('a-new', 'A', '2026-02-01', 7),
      makeSup('b-new', 'B', '2026-02-01', 8),
    ];
    const rubrosPorSup = {
      'a-old': [makeRubro('cocina', 'Cocina', 1, 5)], // Se ignora (no es la última)
      'a-new': [makeRubro('cocina', 'Cocina', 1, 8)],
      'b-new': [
        makeRubro('cocina', 'Cocina', 1, 7),
        makeRubro('armeria', 'Armería', 2, 9),
      ],
    };
    render(
      <CompararCliente
        centrosDisponibles={['A', 'B']}
        todasSups={todasSups}
        rubrosPorSup={rubrosPorSup}
      />
    );

    const radar = screen.getByTestId('radar-mock');
    // 2 rubros únicos: Cocina, Armería
    expect(radar.dataset.numRubros).toBe('2');
  });

  it('KPI "Supervisiones" cuenta el total de visitas de los centros seleccionados', () => {
    const todasSups = [
      makeSup('1', 'A', '2026-01-01', 7),
      makeSup('2', 'A', '2026-02-01', 8),
      makeSup('3', 'B', '2026-01-01', 6),
    ];
    render(
      <CompararCliente
        centrosDisponibles={['A', 'B']}
        todasSups={todasSups}
        rubrosPorSup={{}}
      />
    );

    // Default selecciona A y B → 3 supervisiones totales
    // El KPI "Supervisiones" debe mostrar 3
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('Insights se calcula con la lógica completa: dispara mejora cuando aplica', () => {
    // A: subió de 6 a 9 (delta +3). Debería disparar regla1Mejora
    const todasSups = [
      makeSup('1', 'A', '2026-01-01', 6),
      makeSup('2', 'A', '2026-02-01', 9),
      makeSup('3', 'B', '2026-01-01', 7),
      makeSup('4', 'B', '2026-02-01', 7.5),
    ];
    render(
      <CompararCliente
        centrosDisponibles={['A', 'B']}
        todasSups={todasSups}
        rubrosPorSup={{}}
      />
    );

    const insights = screen.getByTestId('insights-mock');
    expect(insights.dataset.tipos).toContain('mejora');
  });

  it('contador "X/7" del selector se actualiza dinámicamente', () => {
    const centros = ['A', 'B', 'C', 'D', 'E'];
    render(
      <CompararCliente
        centrosDisponibles={centros}
        todasSups={[]}
        rubrosPorSup={{}}
      />
    );

    // Default: 3 → badge "3/7"
    expect(screen.getByText(/^3\/7$/)).toBeInTheDocument();

    // Toggle adds D, E → 5
    fireEvent.click(screen.getByRole('button', { name: /^D$/ }));
    fireEvent.click(screen.getByRole('button', { name: /^E$/ }));

    expect(screen.getByText(/^5\/7$/)).toBeInTheDocument();
  });
});
