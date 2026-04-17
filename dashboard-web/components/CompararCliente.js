'use client';

import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { colorPorCalificacion, formatearFecha } from '../lib/colores';

const PALETA = ['#8A2035', '#D4A94C', '#2E7D32', '#1565C0', '#6A1B9A', '#E65100', '#00838F'];

export default function CompararCliente({ centrosDisponibles, todasSups, rubrosPorSup }) {
  const [seleccionados, setSeleccionados] = useState([]);

  const toggle = (nombre) => {
    setSeleccionados((prev) =>
      prev.includes(nombre)
        ? prev.filter((n) => n !== nombre)
        : prev.length < 7
          ? [...prev, nombre]
          : prev
    );
  };

  // Series temporales para la gráfica de líneas
  const datosLineas = useMemo(() => {
    if (seleccionados.length === 0) return [];
    // Crear un eje X común: todas las fechas de los centros seleccionados
    const fechas = new Set();
    const porCentro = {};
    for (const nombre of seleccionados) {
      const sups = todasSups.filter((s) => s.nombre_cprs === nombre);
      porCentro[nombre] = {};
      for (const s of sups) {
        const k = formatearFecha(s.fecha_hora_supervision);
        fechas.add(k);
        porCentro[nombre][k] = Number(s.promedio_general || 0);
      }
    }
    const ejeX = Array.from(fechas).sort((a, b) => new Date(a) - new Date(b));
    return ejeX.map((fecha) => {
      const row = { fecha };
      for (const nombre of seleccionados) {
        row[nombre] = porCentro[nombre][fecha] ?? null;
      }
      return row;
    });
  }, [seleccionados, todasSups]);

  // Desglose por rubro (último valor por centro)
  const datosBarras = useMemo(() => {
    if (seleccionados.length === 0) return [];
    const rubros = new Map();
    for (const nombre of seleccionados) {
      const sups = todasSups
        .filter((s) => s.nombre_cprs === nombre)
        .sort((a, b) => new Date(b.fecha_hora_supervision) - new Date(a.fecha_hora_supervision));
      const ultima = sups[0];
      if (!ultima) continue;
      const rs = (rubrosPorSup[ultima.id] || []).filter((r) => !r.no_aplica);
      for (const r of rs) {
        if (!rubros.has(r.rubro_catalog_id)) {
          rubros.set(r.rubro_catalog_id, { rubro: r.nombre, orden: r.orden });
        }
        rubros.get(r.rubro_catalog_id)[nombre] = r.calificacion;
      }
    }
    return Array.from(rubros.values()).sort((a, b) => (a.orden || 0) - (b.orden || 0));
  }, [seleccionados, todasSups, rubrosPorSup]);

  return (
    <div>
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Selecciona centros a comparar</h2>
        <p className="text-sm text-gray-500 mb-4">Máximo 7 centros. Selección: {seleccionados.length}</p>
        <div className="flex flex-wrap gap-2">
          {centrosDisponibles.map((c) => {
            const activo = seleccionados.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggle(c)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
                  activo
                    ? 'bg-guinda text-white border-guinda'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-guinda'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {seleccionados.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-500">
          <p className="text-lg">Elige al menos un centro para ver la comparación.</p>
        </div>
      ) : (
        <>
          {/* Gráfica temporal */}
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Evolución del promedio</h2>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={datosLineas} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} ticks={[0, 2, 4, 6, 8, 10]} />
                  <Tooltip contentStyle={{ borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {seleccionados.map((nombre, i) => (
                    <Line
                      key={nombre}
                      type="monotone"
                      dataKey={nombre}
                      stroke={PALETA[i % PALETA.length]}
                      strokeWidth={2.5}
                      connectNulls
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfica de barras por rubro (última supervisión) */}
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Desempeño por rubro</h2>
            <p className="text-sm text-gray-500 mb-4">Basado en la última supervisión finalizada de cada centro</p>
            <div className="w-full h-[520px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosBarras} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="rubro" tick={{ fontSize: 10 }} width={200} />
                  <Tooltip contentStyle={{ borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {seleccionados.map((nombre, i) => (
                    <Bar key={nombre} dataKey={nombre} fill={PALETA[i % PALETA.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla resumen */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Resumen comparativo</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-600 uppercase">C.P.R.S.</th>
                    <th className="text-center px-6 py-3 text-xs font-bold text-gray-600 uppercase">Supervisiones</th>
                    <th className="text-center px-6 py-3 text-xs font-bold text-gray-600 uppercase">Primera</th>
                    <th className="text-center px-6 py-3 text-xs font-bold text-gray-600 uppercase">Actual</th>
                    <th className="text-center px-6 py-3 text-xs font-bold text-gray-600 uppercase">Mejora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {seleccionados.map((nombre) => {
                    const sups = todasSups
                      .filter((s) => s.nombre_cprs === nombre)
                      .sort((a, b) => new Date(a.fecha_hora_supervision) - new Date(b.fecha_hora_supervision));
                    if (sups.length === 0) return null;
                    const primera = sups[0];
                    const ultima = sups[sups.length - 1];
                    const delta = Number(ultima.promedio_general) - Number(primera.promedio_general);
                    return (
                      <tr key={nombre} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-semibold text-gray-800">{nombre}</td>
                        <td className="text-center px-6 py-3 text-gray-700">{sups.length}</td>
                        <td className="text-center px-6 py-3">
                          <span className="inline-block min-w-[50px] px-2 py-0.5 rounded text-white font-bold text-sm" style={{ backgroundColor: colorPorCalificacion(Math.round(primera.promedio_general)) }}>
                            {Number(primera.promedio_general).toFixed(2)}
                          </span>
                        </td>
                        <td className="text-center px-6 py-3">
                          <span className="inline-block min-w-[50px] px-2 py-0.5 rounded text-white font-bold text-sm" style={{ backgroundColor: colorPorCalificacion(Math.round(ultima.promedio_general)) }}>
                            {Number(ultima.promedio_general).toFixed(2)}
                          </span>
                        </td>
                        <td className="text-center px-6 py-3">
                          {delta > 0 ? (
                            <span className="text-green-700 font-bold">▲ +{delta.toFixed(2)}</span>
                          ) : delta < 0 ? (
                            <span className="text-red-700 font-bold">▼ {delta.toFixed(2)}</span>
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
          </div>
        </>
      )}
    </div>
  );
}
