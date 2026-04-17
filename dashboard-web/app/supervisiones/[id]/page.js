import Link from 'next/link';
import { notFound } from 'next/navigation';
import { crearClienteServidor } from '../../../lib/supabase-server';
import Header from '../../../components/Header';
import { colorPorCalificacion, formatearFecha } from '../../../lib/colores';

export const dynamic = 'force-dynamic';

/**
 * Detalle de UNA supervisión:
 *  - Datos generales + promedio
 *  - Cada rubro con calificación, criterios SÍ/NO, observación y FOTOS
 *  - Las fotos vienen del bucket privado; generamos signed URLs (TTL 1h)
 */
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

  // Generar signed URLs para cada foto (TTL 1 hora)
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
  const colorProm = colorPorCalificacion(Math.round(sup.promedio_general));

  return (
    <>
      <Header email={user?.email} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Link
          href={`/cprs/${encodeURIComponent(sup.nombre_cprs)}`}
          className="text-guinda font-semibold hover:underline"
        >
          ← {sup.nombre_cprs}
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4 mt-3">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Supervisión del {formatearFecha(sup.fecha_hora_supervision)}</h1>
            <p className="text-gray-500 mt-1">
              {sup.nombre_cprs} · Estado: <span className="font-semibold capitalize">{sup.estado}</span>
            </p>
          </div>
          <div className="text-center">
            <div
              className="text-4xl font-extrabold px-6 py-3 rounded-2xl text-white"
              style={{ backgroundColor: colorProm }}
            >
              {Number(sup.promedio_general || 0).toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mt-2 font-bold">Promedio</p>
          </div>
        </div>

        {/* KPIs rápidos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-3xl font-extrabold text-guinda">{rubros.length}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Rubros</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-3xl font-extrabold text-green-700">{evaluados.length}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Evaluados</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-3xl font-extrabold text-gray-500">{noAplican.length}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">No aplican</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-3xl font-extrabold text-guinda">{totalFotos}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Fotos</p>
          </div>
        </div>

        {/* Cada rubro */}
        <div className="mt-8 space-y-6">
          {rubros.map((r) => {
            const color = colorPorCalificacion(r.calificacion);
            const cumplidos = r.criterios.filter((c) => c.cumple === true).length;
            const totalCrit = r.criterios.length;

            return (
              <div key={r.id} className="bg-white rounded-2xl shadow overflow-hidden">
                {/* Header del rubro */}
                <div
                  className="p-4 flex items-center justify-between"
                  style={{ backgroundColor: r.no_aplica ? '#6b7280' : color }}
                >
                  <div>
                    <p className="text-white/80 text-xs font-bold tracking-wider">RUBRO {r.orden}</p>
                    <h2 className="text-white text-xl font-bold">{r.nombre}</h2>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-2 text-white font-extrabold text-3xl">
                    {r.no_aplica ? 'N/A' : (r.calificacion ?? '—')}
                  </div>
                </div>

                <div className="p-5">
                  {r.no_aplica ? (
                    <p className="text-gray-600 italic text-center py-6">
                      Este rubro no aplica para este C.P.R.S. — no se contabiliza en el promedio.
                    </p>
                  ) : (
                    <>
                      {/* Criterios */}
                      {totalCrit > 0 && (
                        <div className="mb-5">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Criterios evaluados</h3>
                            <span className="text-xs bg-guinda/10 text-guinda font-bold px-2 py-0.5 rounded-full">
                              {cumplidos}/{totalCrit} cumplen
                            </span>
                          </div>
                          <ul className="space-y-1.5">
                            {r.criterios.map((c) => (
                              <li key={c.id} className="flex items-start gap-3 text-sm">
                                <span
                                  className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white font-bold text-xs flex-shrink-0 ${
                                    c.cumple === true
                                      ? 'bg-green-600'
                                      : c.cumple === false
                                        ? 'bg-red-600'
                                        : 'bg-gray-400'
                                  }`}
                                >
                                  {c.cumple === true ? '✓' : c.cumple === false ? '✗' : '—'}
                                </span>
                                <span className="text-gray-800">{c.texto}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Observación */}
                      {r.observacion && (
                        <div className="mb-5 p-4 bg-amber-50 border-l-4 border-amber-400 rounded">
                          <p className="text-xs font-bold text-amber-900 uppercase mb-1">Observación</p>
                          <p className="text-gray-800 whitespace-pre-line">{r.observacion}</p>
                        </div>
                      )}

                      {/* Fotos */}
                      {r.fotos.length > 0 ? (
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-2">
                            Fotos ({r.fotos.length})
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {r.fotos.map((f) => (
                              <a
                                key={f.id}
                                href={f.url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:ring-4 hover:ring-guinda/30 transition"
                              >
                                {f.url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={f.url}
                                    alt={`Foto ${f.orden + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                                    Foto no disponible
                                  </div>
                                )}
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Sin fotos registradas</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
