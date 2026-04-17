/**
 * Helpers de calificación compartidos con la app móvil.
 */
export const colorPorCalificacion = (cal) => {
  if (cal == null) return '#888888';
  if (cal <= 4) return '#C62828'; // rojo
  if (cal <= 6) return '#F9A825'; // amarillo
  if (cal <= 8) return '#7CB342'; // verde claro
  return '#2E7D32'; // verde fuerte
};

export const textoCalificacion = (cal) => {
  if (cal == null) return 'Sin evaluar';
  if (cal <= 4) return 'Crítico';
  if (cal <= 6) return 'Regular';
  if (cal <= 8) return 'Bueno';
  return 'Excelente';
};

export const formatearFecha = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};
