import Link from 'next/link';
import { crearClienteServidor } from '../../../lib/supabase-server';
import Header from '../../../components/Header';
import HistoricoChart from '../../../components/HistoricoChart';
import HexKpiCard from '../../../components/ui/HexKpiCard';
import HudFrame from '../../../components/ui/HudFrame';
import GaugeCard from '../../../components/ui/GaugeCard';
import {
  IconTarget,
  IconPin,
  IconTrendUp,
  IconTrendDown,
  IconClipboard,
  IconLineChart,
  IconPuzzle,
} from '../../../components/ui/icons';
import { colorPorCalificacion, formatearFecha } from '../../../lib/colores';

export const dynamic = 'force-dynamic';

async function cargar(nombre) {
  const supabase = crearClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: sups, error: errSup } = await supabase
    .from('supervisiones')
    .select('id, nombre_cprs, fecha_hora_supervision, estado, promedio_general')
    .eq('nombre_cprs', nombre)
    .eq('estado', 'finalizado')
    .order('fecha_hora_supervision', { ascending: true });

  if (errSup) {
    console.error(errSup);
    return { user, supervisiones: [], rubrosPorSup: {} };
  }

  if (!sups || sups.length === 0) {
    return { user, supervisiones: [], rubrosPorSup: {} };
  }

  const supIds = sups.map((s) => s.id);
  const { data: rubros, error: errRub } = await supabase
    .from('rubros')
    .select('id, supervision_id, rubro_catalog_id, nombre, orden, no_aplica, calificacion')
    .in('supervision_id', supIds);

  if (errRub) console.error(errRub);

  const rubrosPorSup = {};
  for (const r of rubros || []) {
    if (!rubrosPorSup[r.supervision_id]) rubrosPorSup[r.supervision_id] = [];
    rubrosPorSup[r.supervision_id].push(r);
  }

  return { user, supervisiones: sups, rubrosPorSup };
}

export default async function CentroPage({ params }) {
  const nombre = decodeURIComponent(params.nombre);
  const { user, supervisiones, rubrosPorSup } = await cargar(nombre);

  if (supervisiones.length === 0) {
    return (
      <>
        <Header email={user?.email} />
        <main className="max-w-7xl mx-auto px-6 py-12">
          <HudFrame tone="dark" className="text-center py-16">
            <h1 className="text-3xl font-black text-white">{nombre}</h1>
            <p className="text-white/60 mt-3">
              No hay supervisiones finalizadas para este centro.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block bg-gradient-inst text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition shadow-inst-glow"
            >
              ← Volver al listado
            </Link>
          </HudFrame>
        </main>
      </>
    );
  }

  const datosGrafica = supervisiones.map((s) => ({
    fecha: formatearFecha(s.fecha_hora_supervision),
    promedio: Number(s.promedio_general || 0),
    id: s.id,
  }));

  const ultima = supervisiones[supervisiones.length - 1];
  const primera = supervisiones[0];
  const mejora = ultima.promedio_general - primera.promedio_general;

  const rubrosUnicos = new Map();
  for (const sup of supervisiones) {
    const rs = rubrosPorSup[sup.id] || [];
    for (const r of rs) {
      if (r.no_aplica) continue;
      if (!rubrosUnicos.has(r.rubro_catalog_id)) {
        rubrosUnicos.set(r.rubro_catalog_id, {
          nombre: r.nombre,
          orden: r.orden,
          evolucion: [],
        });
      }
      rubrosUnicos.get(r.rubro_catalog_id).evolucion.push({
        fecha: sup.fecha_hora_supervision,
        calificacion: r.calificacion,
      });
    }
  }

  const rubrosArr = Array.from(rubrosUnicos.entries()).map(([id, data]) => {
    const ultimaCal = data.evolucion[data.evolucion.length - 1]?.calificacion;
    const primeraCal = data.evolucion[0]?.calificacion;
    const delta = (ultimaCal != null && primeraCal != null) ? ultimaCal - primeraCal : null;
    const promedio = data.evolucion.length > 0
      ? data.evolucion.reduce((acc, e) => acc + (e.calificacion || 0), 0) / data.evolucion.length
      : 0;
    return { id, ...data, ultimaCal, primeraCal, delta, promedio };
  });
  rubrosArr.sort((a, b) => (a.orden || 0) - (b.orden || 0));

  return (
    <>
      <Header email={user?.email} />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-dorado-300 font-semibold hover:text-dorado-200 transition-colors text-sm"
        >
          <span>←</span> Todos los centros
        </Link>

        <div className="mt-4 mb-10 animate-slide-up">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-block w-10 h-0.5 bg-gradient-to-r from-transparent via-dorado-500 to-dorado-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-dorado-300">
              Histórico institucional
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none text-white">
            {nombre}
          </h1>
          <p className="text-white/65 text-base mt-3">
            {supervisiones.length} supervisión{supervisiones.length !== 1 ? 'es' : ''} finalizada{supervisiones.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* KPIs hexagonales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <HexKpiCard
            icon={<IconTarget />}
            value={Number(ultima.promedio_general || 0).toFixed(2)}
            label="Promedio actual"
            tone={ultima.promedio_general >= 8 ? 'dorado' : 'guinda'}
            hint={formatearFecha(ultima.fecha_hora_supervision)}
          />
          <HexKpiCard
            icon={<IconPin />}
            value={Number(primera.promedio_general || 0).toFixed(2)}
            label="Primera medición"
            tone="neutro"
            hint={formatearFecha(primera.fecha_hora_supervision)}
          />
          <HexKpiCard
            icon={mejora >= 0 ? <IconTrendUp /> : <IconTrendDown />}
            value={`${mejora > 0 ? '+' : ''}${mejora.toFixed(2)}`}
            label="Mejora total"
            tone={mejora >= 0 ? 'dorado' : 'guinda'}
            hint="primera vs última"
          />
          <HexKpiCard
            icon={<IconClipboard />}
            value={`${rubrosArr.length}/15`}
            label="Rubros evaluados"
            tone="guinda"
            hint="del estándar oficial"
          />
        </div>

        {/* Gauge + Gráfica */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <HudFrame
            title="Promedio actual"
            subtitle="última supervisión finalizada"
            tone="dark"
            badge={<IconTarget className="text-dorado-300" />}
          >
            <div className="py-4">
              <GaugeCard
                value={Number(ultima.promedio_general || 0)}
                label="Calificación general"
                sublabel={`${supervisiones.length} visitas históricas`}
              />
            </div>
          </HudFrame>

          <HudFrame
            title="Evolución del promedio general"
            subtitle="comportamiento histórico de las visitas"
            tone="dark"
            badge={<IconLineChart className="text-dorado-300" />}
            className="lg:col-span-2"
          >
            <HistoricoChart datos={datosGrafica} />
          </HudFrame>
        </div>

        {/* Lista de supervisiones */}
        <HudFrame
          title="Supervisiones realizadas"
          subtitle="click para ver fotos, criterios y observaciones"
          tone="dark"
          badge={<IconClipboard className="text-dorado-300" />}
          className="mb-8"
        >
          <div className="-m-5">
            {[...supervisiones].reverse().map((s, idx) => {
              const color = colorPorCalificacion(Math.round(s.promedio_general));
              const isLast = idx === supervisiones.length - 1;
              return (
                <Link
                  key={s.id}
                  href={`/supervisiones/${s.id}`}
                  className={`group flex items-center justify-between px-6 py-4 hover:bg-dorado-500/5 transition ${
                    !isLast ? 'border-b border-white/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-full font-black flex items-center justify-center text-sm tabular-nums"
                      style={{
                        background: 'linear-gradient(135deg, #9F2241 0%, #5C2E37 100%)',
                        color: '#FBF6EB',
                        boxShadow: '0 0 14px -2px rgba(159,34,65,0.4)',
                      }}
                    >
                      #{supervisiones.length - idx}
                    </div>
                    <div>
                      <p className="font-semibold text-white group-hover:text-dorado-300 transition-colors">
                        {formatearFecha(s.fecha_hora_supervision)}
                      </p>
                      <p className="text-xs text-white/45">Ver fotos y detalle →</p>
                    </div>
                  </div>
                  <div
                    className="px-4 py-1.5 rounded-full text-white font-bold text-sm min-w-[72px] text-center tabular-nums"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 14px -2px ${color}88`,
                    }}
                  >
                    {Number(s.promedio_general || 0).toFixed(2)}
                  </div>
                </Link>
              );
            })}
          </div>
        </HudFrame>

        {/* Tabla por rubro */}
        <HudFrame
          title="Desempeño por rubro"
          subtitle="calificación actual vs primera medición"
          tone="dark"
          badge={<IconPuzzle className="text-dorado-300" />}
        >
          <div className="overflow-x-auto -m-5">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-dorado-500/15">
                  <th className="text-left px-6 py-3 text-[10px] font-bold text-dorado-300 uppercase tracking-[0.18em]">
                    Rubro
                  </th>
                  <th className="text-center px-6 py-3 text-[10px] font-bold text-dorado-300 uppercase tracking-[0.18em]">
                    Primera
                  </th>
                  <th className="text-center px-6 py-3 text-[10px] font-bold text-dorado-300 uppercase tracking-[0.18em]">
                    Actual
                  </th>
                  <th className="text-center px-6 py-3 text-[10px] font-bold text-dorado-300 uppercase tracking-[0.18em]">
                    Promedio
                  </th>
                  <th className="text-center px-6 py-3 text-[10px] font-bold text-dorado-300 uppercase tracking-[0.18em]">
                    Cambio
                  </th>
                </tr>
              </thead>
              <tbody>
                {rubrosArr.map((r, i) => {
                  const isLast = i === rubrosArr.length - 1;
                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-dorado-500/5 transition ${
                        !isLast ? 'border-b border-white/5' : ''
                      }`}
                    >
                      <td className="px-6 py-3 font-medium text-white/90">
                        <span className="text-dorado-300 font-bold mr-2 tabular-nums">
                          {r.orden}.
                        </span>
                        {r.nombre}
                      </td>
                      <td className="text-center px-6 py-3">
                        <span
                          className="inline-block min-w-[42px] px-2 py-0.5 rounded text-white font-bold text-sm tabular-nums"
                          style={{ backgroundColor: colorPorCalificacion(r.primeraCal) }}
                        >
                          {r.primeraCal ?? '—'}
                        </span>
                      </td>
                      <td className="text-center px-6 py-3">
                        <span
                          className="inline-block min-w-[42px] px-2 py-0.5 rounded text-white font-bold text-sm tabular-nums"
                          style={{ backgroundColor: colorPorCalificacion(r.ultimaCal) }}
                        >
                          {r.ultimaCal ?? '—'}
                        </span>
                      </td>
                      <td className="text-center px-6 py-3 text-white/85 font-semibold tabular-nums">
                        {r.promedio.toFixed(2)}
                      </td>
                      <td className="text-center px-6 py-3">
                        {r.delta == null ? (
                          <span className="text-white/35 text-sm">—</span>
                        ) : r.delta > 0 ? (
                          <span className="text-emerald-400 font-bold tabular-nums">
                            ▲ +{r.delta}
                          </span>
                        ) : r.delta < 0 ? (
                          <span className="text-red-400 font-bold tabular-nums">
                            ▼ {r.delta}
                          </span>
                        ) : (
                          <span className="text-white/55 font-bold tabular-nums">= 0</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </HudFrame>
      </main>
    </>
  );
}
