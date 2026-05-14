import Link from 'next/link';
import { crearClienteServidor } from '../lib/supabase-server';
import Header from '../components/Header';
import HexKpiCard from '../components/ui/HexKpiCard';
import HudFrame from '../components/ui/HudFrame';
import CentrosTable from '../components/CentrosTable';
import {
  IconBuilding,
  IconClipboard,
  IconChart,
  IconShield,
} from '../components/ui/icons';

export const dynamic = 'force-dynamic';

async function cargarDatos() {
  const supabase = crearClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();

  // 1) Catálogo oficial (con fallback si la tabla aún no se migró)
  const { data: catalogoData } = await supabase
    .from('cprs_centros')
    .select('nombre, orden')
    .eq('activo', true)
    .order('orden', { ascending: true });

  // 2) Supervisiones finalizadas
  const { data: supervisiones, error } = await supabase
    .from('supervisiones')
    .select('id, nombre_cprs, fecha_hora_supervision, estado, promedio_general, user_id')
    .eq('estado', 'finalizado')
    .order('fecha_hora_supervision', { ascending: false });

  if (error) {
    console.error('Error cargando supervisiones:', error.message);
    return { user, centros: [] };
  }

  const agrupados = {};
  for (const sup of supervisiones || []) {
    const nombre = sup.nombre_cprs || 'Sin nombre';
    if (!agrupados[nombre]) agrupados[nombre] = [];
    agrupados[nombre].push(sup);
  }

  const tieneCatalogo = catalogoData && catalogoData.length > 0;
  const nombresBase = tieneCatalogo
    ? catalogoData.map((c) => c.nombre)
    : Object.keys(agrupados);

  for (const nombre of Object.keys(agrupados)) {
    if (!nombresBase.includes(nombre)) nombresBase.push(nombre);
  }

  const estadoDe = (prom) => {
    if (prom == null) return 'Pendiente';
    if (prom >= 8) return 'Óptimo';
    if (prom >= 6) return 'Aceptable';
    return 'En riesgo';
  };

  const centros = nombresBase.map((nombre) => {
    const items = agrupados[nombre] || [];
    const ultima = items[0];
    const anterior = items[1];
    const delta = anterior
      ? (ultima.promedio_general - anterior.promedio_general)
      : null;
    return {
      nombre,
      totalSupervisiones: items.length,
      ultima,
      promedioActual: ultima?.promedio_general ?? null,
      promedioAnterior: anterior?.promedio_general ?? null,
      delta,
      ultimaFecha: ultima?.fecha_hora_supervision || null,
      estado: estadoDe(ultima?.promedio_general ?? null),
    };
  });

  if (!tieneCatalogo) {
    centros.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  return { user, centros };
}

export default async function HomePage() {
  const { user, centros } = await cargarDatos();

  const evaluados = centros.filter((c) => c.totalSupervisiones > 0);
  const totalSups = centros.reduce((acc, c) => acc + c.totalSupervisiones, 0);
  const promGlobal = evaluados.length > 0
    ? evaluados.reduce((acc, c) => acc + (c.promedioActual || 0), 0) / evaluados.length
    : 0;

  const cumplimientoTexto =
    evaluados.length === 0
      ? 'Sin datos'
      : promGlobal >= 8
        ? 'Óptimo'
        : promGlobal >= 6
          ? 'Aceptable'
          : 'En riesgo';

  return (
    <>
      <Header email={user?.email} />

      <main className="bg-orbs max-w-7xl mx-auto px-6 py-12 relative">
        {/* Título institucional */}
        <div className="mb-12 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block w-12 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#B69566] to-[#9F2241]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: 'var(--brand-accent)' }}>
              Centros Penitenciarios · Reinserción Social
            </span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-[0.95]">
            <span className="text-gradient-dark">Panel </span>
            <span className="text-gradient-gold">Institucional</span>
          </h1>
          <p className="text-lg mt-5 max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Vista consolidada de supervisiones, promedios y tendencias por centro.
            Selecciona un centro para ver su histórico completo.
          </p>
        </div>

        {/* KPIs hexagonales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <HexKpiCard
            icon={<IconBuilding />}
            value={`${evaluados.length}/${centros.length}`}
            label="Centros evaluados"
            tone="guinda"
            hint={`del catálogo de ${centros.length}`}
            delay={0.05}
          />
          <HexKpiCard
            icon={<IconClipboard />}
            value={totalSups}
            label="Total supervisiones"
            tone="dorado"
            delay={0.10}
          />
          <HexKpiCard
            icon={<IconChart />}
            value={Number(promGlobal.toFixed(2))}
            label="Promedio global"
            tone={promGlobal >= 8 ? 'verde' : promGlobal >= 6 ? 'ambar' : 'rojo'}
            hint={cumplimientoTexto}
            delay={0.15}
          />
          <HexKpiCard
            icon={<IconShield />}
            value={centros.filter((c) => (c.promedioActual ?? 0) >= 8).length}
            label="Centros en óptimo"
            tone="neutro"
            hint={`de ${evaluados.length} evaluados`}
            delay={0.20}
          />
        </div>

        {/* Tabla de centros con filtros + sort + búsqueda */}
        <HudFrame
          title="Centros penitenciarios"
          subtitle="Filtra por estado, busca por nombre, ordena por cualquier columna"
          tone="auto"
          delay={0.25}
          badge={
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tabular-nums"
              style={{
                background: 'rgba(182, 149, 102, 0.14)',
                border: '1px solid rgba(182, 149, 102, 0.35)',
                color: 'var(--brand-accent)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-dorado-500 animate-pulse" />
              {centros.length} activos
            </span>
          }
        >
          <CentrosTable centros={centros} />
        </HudFrame>
      </main>
    </>
  );
}

