import Link from 'next/link';
import { notFound } from 'next/navigation';
import { crearClienteServidor } from '../../../lib/supabase-server';
import Header from '../../../components/Header';
import HexKpiCard from '../../../components/ui/HexKpiCard';
import HudFrame from '../../../components/ui/HudFrame';
import GaugeCard from '../../../components/ui/GaugeCard';
import { colorPorCalificacion, formatearFecha } from '../../../lib/colores';

export const dynamic = 'force-dynamic';

async function cargar(id) {
  const supabase = crearClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: sup } = await supabase
    .from('supervisiones')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!sup) return { user, sup: null, rubros: [], fotosPorRubro: {} };

  const { data: rubros } = await supabase
    .from('rubros')
    .select('*')
    .eq('supervision_id', id)
    .order('orden');

  const rubroIds = (rubros || []).map((r) => r.id);

  const [criteriosResp, fotosResp] = await Promise.all([
    supabase.from('criterios_rubro').select('*').in('rubro_id', rubroIds).order('orden'),
    supabase.from('fotos_rubro').select('*').in('rubro_id', rubroIds).order('orden'),
  ]);

  const criteriosPorRubro = {};
  for (const c of criteriosResp.data || []) {
    if (!criteriosPorRubro[c.rubro_id]) criteriosPorRubro[c.rubro_id] = [];
    criteriosPorRubro[c.rubro_id].push(c);
  }

  const fotosPorRubro = {};
  for (const f of fotosResp.data || []) {
    if (!fotosPorRubro[f.rubro_id]) fotosPorRubro[f.rubro_id] = [];
    const { data: signed } = await supabase.storage
      .from('supervisiones-fotos')
      .createSignedUrl(f.storage_path, 3600);
    fotosPorRubro[f.rubro_id].push({ ...f, url: signed?.signedUrl });
  }

  const rubrosConRelaciones = (rubros || []).map((r) => ({
    ...r,
    criterios: criteriosPorRubro[r.id] || [],
    fotos: fotosPorRubro[r.id] || [],
  }));

  return { user, sup, rubros: rubrosConRelaciones };
}

export default async function SupervisionDetalle({ params }) {
  const { user, sup, rubros } = await cargar(params.id);

  if (!sup) return notFound();

  const evaluados = rubros.filter((r) => !r.no_aplica);
  const noAplican = rubros.filter((r) => r.no_aplica);
  const totalFotos = rubros.reduce((acc, r) => acc + (r.fotos?.length || 0), 0);

  return (
    <div className="bg-analytics min-h-screen">
      <Header email={user?.email} />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <Link
          href={`/cprs/${encodeURIComponent(sup.nombre_cprs)}`}
          className="inline-flex items-center gap-2 text-dorado-300 font-semibold hover:text-dorado-200 transition-colors text-sm"
        >
          <span>←</span> {sup.nombre_cprs}
        </Link>

        <div className="mt-4 mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-block w-10 h-0.5 bg-gradient-to-r from-transparent via-dorado-500 to-dorado-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-dorado-300">
              Detalle de supervisión
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white">
            Supervisión del {formatearFecha(sup.fecha_hora_supervision)}
          </h1>
          <p className="text-white/65 text-base mt-2">
            {sup.nombre_cprs} ·{' '}
            <span className="font-semibold capitalize text-dorado-300">
              {sup.estado}
            </span>
          </p>
        </div>

        {/* Gauge + KPIs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <HudFrame
            title="Promedio general"
            subtitle="calificación final de la supervisión"
            tone="dark"
            badge={<span className="text-base">🎯</span>}
          >
            <div className="py-4">
              <GaugeCard
                value={Number(sup.promedio_general || 0)}
                label="Promedio"
                sublabel={`${evaluados.length} de ${rubros.length} rubros evaluados`}
              />
            </div>
          </HudFrame>

          <div className="lg:col-span-2 grid grid-cols-2 gap-6">
            <HexKpiCard
              icon="📋"
              value={rubros.length}
              label="Rubros totales"
              tone="guinda"
            />
            <HexKpiCard
              icon="✅"
              value={evaluados.length}
              label="Evaluados"
              tone="dorado"
            />
            <HexKpiCard
              icon="⊘"
              value={noAplican.length}
              label="No aplican"
              tone="neutro"
            />
            <HexKpiCard
              icon="📸"
              value={totalFotos}
              label="Fotos"
              tone="guinda"
              hint="evidencia documental"
            />
          </div>
        </div>

        {/* Cada rubro */}
        <div className="space-y-6">
          {rubros.map((r) => {
            const color = colorPorCalificacion(r.calificacion);
            const cumplidos = r.criterios.filter((c) => c.cumple === true).length;
            const totalCrit = r.criterios.length;

            return (
              <div
                key={r.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(15,6,8,0.96) 0%, rgba(26,11,16,0.94) 100%)',
                  border: '1px solid rgba(182, 149, 102, 0.18)',
                  boxShadow: '0 0 24px -4px rgba(159, 34, 65, 0.3)',
                }}
              >
                {/* Header del rubro */}
                <div
                  className="p-5 flex items-center justify-between"
                  style={{
                    background: r.no_aplica
                      ? 'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)'
                      : `linear-gradient(135deg, ${color} 0%, ${color}AA 100%)`,
                    boxShadow: !r.no_aplica
                      ? `inset 0 -1px 0 0 rgba(0,0,0,0.2), 0 0 24px -4px ${color}88`
                      : undefined,
                  }}
                >
                  <div>
                    <p className="text-white/85 text-[10px] font-bold tracking-[0.22em] uppercase">
                      Rubro {r.orden}
                    </p>
                    <h2 className="text-white text-xl font-black mt-1">
                      {r.nombre}
                    </h2>
                  </div>
                  <div
                    className="rounded-xl px-5 py-2 text-white font-black text-3xl tabular-nums"
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.25)',
                    }}
                  >
                    {r.no_aplica ? 'N/A' : (r.calificacion ?? '—')}
                  </div>
                </div>

                <div className="p-5">
                  {r.no_aplica ? (
                    <p className="text-white/55 italic text-center py-6">
                      Este rubro no aplica para este C.P.R.S. — no se contabiliza en el promedio.
                    </p>
                  ) : (
                    <>
                      {totalCrit > 0 && (
                        <div className="mb-5">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-dorado-300 text-[11px] uppercase tracking-[0.18em]">
                              Criterios evaluados
                            </h3>
                            <span className="text-xs bg-dorado-500/15 text-dorado-300 font-bold px-3 py-0.5 rounded-full border border-dorado-500/30 tabular-nums">
                              {cumplidos}/{totalCrit} cumplen
                            </span>
                          </div>
                          <ul className="space-y-2">
                            {r.criterios.map((c) => (
                              <li
                                key={c.id}
                                className="flex items-start gap-3 text-sm"
                              >
                                <span
                                  className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white font-bold text-xs flex-shrink-0 ${
                                    c.cumple === true
                                      ? 'bg-emerald-600'
                                      : c.cumple === false
                                        ? 'bg-red-600'
                                        : 'bg-white/20'
                                  }`}
                                  style={
                                    c.cumple === true
                                      ? { boxShadow: '0 0 10px -1px rgba(16,185,129,0.6)' }
                                      : c.cumple === false
                                        ? { boxShadow: '0 0 10px -1px rgba(220,38,38,0.6)' }
                                        : undefined
                                  }
                                >
                                  {c.cumple === true ? '✓' : c.cumple === false ? '✗' : '—'}
                                </span>
                                <span className="text-white/85">{c.texto}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {r.observacion && (
                        <div
                          className="mb-5 p-4 rounded-lg"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(182,149,102,0.12) 0%, rgba(182,149,102,0.05) 100%)',
                            borderLeft: '3px solid #B69566',
                          }}
                        >
                          <p className="text-[10px] font-bold text-dorado-300 uppercase tracking-[0.18em] mb-1">
                            Observación
                          </p>
                          <p className="text-white/85 whitespace-pre-line text-sm leading-relaxed">
                            {r.observacion}
                          </p>
                        </div>
                      )}

                      {r.fotos.length > 0 ? (
                        <div>
                          <h3 className="font-bold text-dorado-300 text-[11px] uppercase tracking-[0.18em] mb-3">
                            Fotos ({r.fotos.length})
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {r.fotos.map((f) => (
                              <a
                                key={f.id}
                                href={f.url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="group relative aspect-square rounded-lg overflow-hidden bg-white/5 hover:ring-2 hover:ring-dorado-500/60 transition"
                              >
                                {f.url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={f.url}
                                    alt={`Foto ${f.orden + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white/35 text-xs text-center p-2">
                                    Foto no disponible
                                  </div>
                                )}
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-white/35 italic">
                          Sin fotos registradas
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
