import Link from 'next/link';
import { crearClienteServidor } from '../lib/supabase-server';
import Header from '../components/Header';
import { colorPorCalificacion, formatearFecha } from '../lib/colores';

/**
 * Home: tabla/grid de CPRS con:
 *  - Última supervisión finalizada
 *  - Promedio actual
 *  - Promedio anterior (tendencia)
 *  - Total de supervisiones
 */

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

  // Agrupar por nombre_cprs
  const agrupados = {};
  for (const sup of supervisiones || []) {
    const nombre = sup.nombre_cprs || 'Sin nombre';
    if (!agrupados[nombre]) agrupados[nombre] = [];
    agrupados[nombre].push(sup);
  }

  const centros = Object.entries(agrupados).map(([nombre, items]) => {
    const ordenadas = items; // ya vienen desc por fecha
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

  // Ordenar por nombre
  centros.sort((a, b) => a.nombre.localeCompare(b.nombre));

  return { user, centros };
}

export default async function HomePage() {
  const { user, centros } = await cargarDatos();

  const totalSups = centros.reduce((acc, c) => acc + c.totalSupervisiones, 0);
  const promGlobal = centros.length > 0
    ? centros.reduce((acc, c) => acc + (c.promedioActual || 0), 0) / centros.length
    : 0;

  return (
    <>
      <Header email={user?.email} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Centros evaluados</p>
            <p className="text-4xl font-extrabold text-guinda mt-2">{centros.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total supervisiones</p>
            <p className="text-4xl font-extrabold text-guinda mt-2">{totalSups}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Promedio global</p>
            <p className="text-4xl font-extrabold mt-2" style={{ color: colorPorCalificacion(Math.round(promGlobal)) }}>
              {promGlobal.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Tabla de centros */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Centros Penitenciarios</h2>
            <span className="text-xs text-gray-500">Click para ver histórico</span>
          </div>

          {centros.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg">Aún no hay supervisiones finalizadas.</p>
              <p className="text-sm mt-2">Cuando los supervisores generen una presentación desde la app móvil, aparecerán aquí.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wide">C.P.R.S.</th>
                    <th className="text-center px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Supervisiones</th>
                    <th className="text-center px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Última</th>
                    <th className="text-center px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Promedio actual</th>
                    <th className="text-center px-6 py-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Tendencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {centros.map((c) => {
                    const color = colorPorCalificacion(Math.round(c.promedioActual));
                    return (
                      <tr key={c.nombre} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <Link href={`/cprs/${encodeURIComponent(c.nombre)}`} className="font-semibold text-gray-900 hover:text-guinda">
                            {c.nombre}
                          </Link>
                        </td>
                        <td className="text-center px-6 py-4 text-gray-700 font-medium">{c.totalSupervisiones}</td>
                        <td className="text-center px-6 py-4 text-gray-600 text-sm">{formatearFecha(c.ultimaFecha)}</td>
                        <td className="text-center px-6 py-4">
                          <span
                            className="inline-block min-w-[60px] px-3 py-1 rounded-full text-white font-bold"
                            style={{ backgroundColor: color }}
                          >
                            {c.promedioActual?.toFixed(2) ?? '—'}
                          </span>
                        </td>
                        <td className="text-center px-6 py-4">
                          {c.delta == null ? (
                            <span className="text-gray-400 text-sm">—</span>
                          ) : c.delta > 0 ? (
                            <span className="text-green-700 font-bold">▲ +{c.delta.toFixed(2)}</span>
                          ) : c.delta < 0 ? (
                            <span className="text-red-700 font-bold">▼ {c.delta.toFixed(2)}</span>
                          ) : (
                            <span className="text-gray-600 font-bold">= 0.00</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
