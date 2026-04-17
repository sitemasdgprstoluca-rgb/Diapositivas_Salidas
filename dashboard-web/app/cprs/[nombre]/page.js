import Link from 'next/link';
import { notFound } from 'next/navigation';
import { crearClienteServidor } from '../../../lib/supabase-server';
import Header from '../../../components/Header';
import HistoricoChart from '../../../components/HistoricoChart';
import { colorPorCalificacion, formatearFecha } from '../../../lib/colores';

export const dynamic = 'force-dynamic';

async function cargar(nombre) {
  const supabase = crearClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();

  // Supervisiones del centro
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
        <main className="max-w-7xl mx-auto px-6 py-12 text-center">
          <div className="bg-white rounded-2xl p-12 shadow">
            <h1 className="text-2xl font-bold text-gray-900">{nombre}</h1>
            <p className="text-gray-600 mt-3">No hay supervisiones finalizadas para este centro.</p>
            <Link href="/" className="mt-6 inline-block bg-guinda text-white font-bold px-6 py-3 rounded-xl hover:bg-guinda-dark transition">
              ← Volver al listado
            </Link>
          </div>
        </main>
      </>
    );
  }

  // Datos para la gráfica temporal
  const datosGrafica = supervisiones.map((s) => ({
    fecha: formatearFecha(s.fecha_hora_supervision),
    promedio: Number(s.promedio_general || 0),
    id: s.id,
  }));

  // Última supervisión
  const ultima = supervisiones[supervisiones.length - 1];
  const primera = supervisiones[0];
  const mejora = ultima.promedio_general - primera.promedio_general;

  // Evolución por rubro: promedio de cada rubro a lo largo del tiempo
  const rubrosUnicos = new Map(); // rubroId -> { nombre, evolucion: [{fecha, cal}] }
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
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Link href="/" className="text-guinda font-semibold hover:underline">← Todos los centros</Link>

        <h1 className="text-3xl font-extrabold text-gray-900 mt-2">{nombre}</h1>
        <p className="text-gray-500 mt-1">{supervisiones.length} supervisión{supervisiones.length !== 1 ? 'es' : ''} finalizada{supervisiones.length !== 1 ? 's' : ''}</p>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white rounded-2xl p-5 shadow">
            <p className="text-xs font-semibold text-gray-500 uppercase">Promedio actual</p>
            <p className="text-3xl font-extrabold mt-1" style={{ color: colorPorCalificacion(Math.round(ultima.promedio_general)) }}>
              {Number(ultima.promedio_general || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-1">{formatearFecha(ultima.fecha_hora_supervision)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow">
            <p className="text-xs font-semibold text-gray-500 uppercase">Primera medición</p>
            <p className="text-3xl font-extrabold mt-1" style={{ color: colorPorCalificacion(Math.round(primera.promedio_general)) }}>
              {Number(primera.promedio_general || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-1">{formatearFecha(primera.fecha_hora_supervision)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow">
            <p className="text-xs font-semibold text-gray-500 uppercase">Mejora total</p>
            <p className={`text-3xl font-extrabold mt-1 ${mejora > 0 ? 'text-green-700' : mejora < 0 ? 'text-red-700' : 'text-gray-700'}`}>
              {mejora > 0 ? '+' : ''}{mejora.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-1">entre primera y última</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow">
            <p className="text-xs font-semibold text-gray-500 uppercase">Rubros evaluados</p>
            <p className="text-3xl font-extrabold text-guinda mt-1">{rubrosArr.length}</p>
            <p className="text-xs text-gray-400 mt-1">de 15 del estándar</p>
          </div>
        </div>

        {/* Gráfica temporal */}
        <div className="bg-white rounded-2xl p-6 shadow mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Evolución del promedio general</h2>
          <HistoricoChart datos={datosGrafica} />
        </div>

        {/* Lista de supervisiones (links al detalle) */}
        <div className="bg-white rounded-2xl shadow mt-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Supervisiones realizadas</h2>
            <p className="text-sm text-gray-500 mt-1">Click para ver fotos, criterios y observaciones</p>
          </div>
          <div className="divide-y divide-gray-100">
            {[...supervisiones].reverse().map((s, idx) => {
              const color = colorPorCalificacion(Math.round(s.promedio_general));
              return (
                <Link
                  key={s.id}
                  href={`/supervisiones/${s.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-guinda/10 text-guinda font-bold flex items-center justify-center text-sm">
                      #{supervisiones.length - idx}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{formatearFecha(s.fecha_hora_supervision)}</p>
                      <p className="text-xs text-gray-500">Ver fotos y detalle →</p>
                    </div>
                  </div>
                  <div
                    className="px-4 py-1.5 rounded-full text-white font-bold text-sm min-w-[70px] text-center"
                    style={{ backgroundColor: color }}
                  >
                    {Number(s.promedio_general || 0).toFixed(2)}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tabla por rubro */}
        <div className="bg-white rounded-2xl shadow mt-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Desempeño por rubro</h2>
            <p className="text-sm text-gray-500 mt-1">Calificación actual vs. primera medición</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-600 uppercase">Rubro</th>
                  <th className="text-center px-6 py-3 text-xs font-bold text-gray-600 uppercase">Primera</th>
                  <th className="text-center px-6 py-3 text-xs font-bold text-gray-600 uppercase">Actual</th>
                  <th className="text-center px-6 py-3 text-xs font-bold text-gray-600 uppercase">Promedio histórico</th>
                  <th className="text-center px-6 py-3 text-xs font-bold text-gray-600 uppercase">Cambio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rubrosArr.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-800">{r.orden}. {r.nombre}</td>
                    <td className="text-center px-6 py-3">
                      <span className="inline-block min-w-[40px] px-2 py-0.5 rounded text-white font-bold text-sm" style={{ backgroundColor: colorPorCalificacion(r.primeraCal) }}>
                        {r.primeraCal ?? '—'}
                      </span>
                    </td>
                    <td className="text-center px-6 py-3">
                      <span className="inline-block min-w-[40px] px-2 py-0.5 rounded text-white font-bold text-sm" style={{ backgroundColor: colorPorCalificacion(r.ultimaCal) }}>
                        {r.ultimaCal ?? '—'}
                      </span>
                    </td>
                    <td className="text-center px-6 py-3 text-gray-700 font-semibold">
                      {r.promedio.toFixed(2)}
                    </td>
                    <td className="text-center px-6 py-3">
                      {r.delta == null ? (
                        <span className="text-gray-400 text-sm">—</span>
                      ) : r.delta > 0 ? (
                        <span className="text-green-700 font-bold">▲ +{r.delta}</span>
                      ) : r.delta < 0 ? (
                        <span className="text-red-700 font-bold">▼ {r.delta}</span>
                      ) : (
                        <span className="text-gray-600 font-bold">= 0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
