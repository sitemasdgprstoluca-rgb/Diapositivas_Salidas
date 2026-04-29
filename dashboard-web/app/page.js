import Link from 'next/link';
import { crearClienteServidor } from '../lib/supabase-server';
import Header from '../components/Header';
import HexKpiCard from '../components/ui/HexKpiCard';
import HudFrame from '../components/ui/HudFrame';
import {
  IconBuilding,
  IconClipboard,
  IconChart,
  IconShield,
} from '../components/ui/icons';
import { colorPorCalificacion, formatearFecha } from '../lib/colores';

export const dynamic = 'force-dynamic';

async function cargarDatos() {
  const supabase = crearClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();

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

  const centros = Object.entries(agrupados).map(([nombre, items]) => {
    const ordenadas = items;
    const ultima = ordenadas[0];
    const anterior = ordenadas[1];
    const delta = anterior ? (ultima.promedio_general - anterior.promedio_general) : null;
    return {
      nombre,
      totalSupervisiones: ordenadas.length,
      ultima,
      promedioActual: ultima?.promedio_general ?? null,
      promedioAnterior: anterior?.promedio_general ?? null,
      delta,
      ultimaFecha: ultima?.fecha_hora_supervision || null,
    };
  });

  centros.sort((a, b) => a.nombre.localeCompare(b.nombre));

  return { user, centros };
}

export default async function HomePage() {
  const { user, centros } = await cargarDatos();

  const totalSups = centros.reduce((acc, c) => acc + c.totalSupervisiones, 0);
  const promGlobal = centros.length > 0
    ? centros.reduce((acc, c) => acc + (c.promedioActual || 0), 0) / centros.length
    : 0;

  const cumplimientoTexto =
    promGlobal >= 8 ? 'Óptimo' : promGlobal >= 6 ? 'Aceptable' : 'En riesgo';

  return (
    <>
      <Header email={user?.email} />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Título institucional */}
        <div className="mb-10 animate-slide-up">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-block w-10 h-0.5 bg-gradient-to-r from-transparent via-dorado-500 to-dorado-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-dorado-300">
              Centros Penitenciarios · Reinserción Social
            </span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-none">
            <span className="text-white">Panel </span>
            <span className="text-gradient-gold">Institucional</span>
          </h1>
          <p className="text-white/65 text-lg mt-4 max-w-2xl leading-relaxed">
            Vista consolidada de supervisiones, promedios y tendencias por centro.
            Selecciona un centro para ver su histórico completo.
          </p>
        </div>

        {/* KPIs hexagonales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <HexKpiCard
            icon={IconBuilding}
            value={centros.length}
            label="Centros evaluados"
            tone="guinda"
          />
          <HexKpiCard
            icon={IconClipboard}
            value={totalSups}
            label="Total supervisiones"
            tone="dorado"
          />
          <HexKpiCard
            icon={IconChart}
            value={promGlobal.toFixed(2)}
            label="Promedio global"
            tone={promGlobal >= 8 ? 'dorado' : 'guinda'}
            hint={cumplimientoTexto}
          />
          <HexKpiCard
            icon={IconShield}
            value={centros.filter((c) => (c.promedioActual ?? 0) >= 8).length}
            label="Centros en óptimo"
            tone="neutro"
            hint={`de ${centros.length || 0}`}
          />
        </div>

        {/* Tabla de centros */}
        <HudFrame
          title="Centros penitenciarios"
          subtitle="Click sobre un centro para abrir su histórico"
          tone="dark"
          badge={
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dorado-500/15 border border-dorado-500/30 text-[11px] font-bold text-dorado-300 tabular-nums">
              <span className="w-1.5 h-1.5 rounded-full bg-dorado-500 animate-pulse" />
              {centros.length} activos
            </span>
          }
        >
          {centros.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-4">📡</div>
              <p className="text-white/70 text-lg font-semibold">
                Aún no hay supervisiones finalizadas.
              </p>
              <p className="text-white/50 text-sm mt-2 max-w-md mx-auto">
                Cuando los supervisores generen una presentación desde la app móvil,
                aparecerán aquí en tiempo real.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -m-5">
              <table className="w-full data-table">
                <thead>
                  <tr className="border-b border-dorado-500/15">
                    <th className="text-left px-6 py-3 text-[10px] font-bold text-dorado-300 uppercase tracking-[0.18em]">
                      C.P.R.S.
                    </th>
                    <th className="text-center px-6 py-3 text-[10px] font-bold text-dorado-300 uppercase tracking-[0.18em]">
                      Supervisiones
                    </th>
                    <th className="text-center px-6 py-3 text-[10px] font-bold text-dorado-300 uppercase tracking-[0.18em]">
                      Última
                    </th>
                    <th className="text-center px-6 py-3 text-[10px] font-bold text-dorado-300 uppercase tracking-[0.18em]">
                      Promedio actual
                    </th>
                    <th className="text-center px-6 py-3 text-[10px] font-bold text-dorado-300 uppercase tracking-[0.18em]">
                      Tendencia
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {centros.map((c, i) => {
                    const color = colorPorCalificacion(Math.round(c.promedioActual));
                    const isLast = i === centros.length - 1;
                    return (
                      <tr
                        key={c.nombre}
                        className={`group transition-colors hover:bg-dorado-500/5 ${
                          !isLast ? 'border-b border-white/5' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/cprs/${encodeURIComponent(c.nombre)}`}
                            className="font-semibold text-white group-hover:text-dorado-300 transition-colors flex items-center gap-2"
                          >
                            <span className="w-1 h-1 rounded-full bg-dorado-500/0 group-hover:bg-dorado-500 transition-colors" />
                            {c.nombre}
                          </Link>
                        </td>
                        <td className="text-center px-6 py-4 text-white/85 font-medium tabular-nums numeric">
                          {c.totalSupervisiones}
                        </td>
                        <td className="text-center px-6 py-4 text-white/55 text-sm tabular-nums">
                          {formatearFecha(c.ultimaFecha)}
                        </td>
                        <td className="text-center px-6 py-4">
                          <span
                            className="inline-block min-w-[68px] px-3.5 py-1 rounded-full text-white font-bold tabular-nums"
                            style={{
                              backgroundColor: color,
                              boxShadow: `0 0 14px -2px ${color}88`,
                            }}
                          >
                            {c.promedioActual?.toFixed(2) ?? '—'}
                          </span>
                        </td>
                        <td className="text-center px-6 py-4">
                          {c.delta == null ? (
                            <span className="text-white/35 text-sm">—</span>
                          ) : c.delta > 0 ? (
                            <span className="text-emerald-400 font-bold tabular-nums">
                              ▲ +{c.delta.toFixed(2)}
                            </span>
                          ) : c.delta < 0 ? (
                            <span className="text-red-400 font-bold tabular-nums">
                              ▼ {c.delta.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-white/55 font-bold tabular-nums">
                              = 0.00
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </HudFrame>
      </main>
    </>
  );
}
