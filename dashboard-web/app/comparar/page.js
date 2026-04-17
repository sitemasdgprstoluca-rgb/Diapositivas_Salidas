import { crearClienteServidor } from '../../lib/supabase-server';
import Header from '../../components/Header';
import CompararCliente from '../../components/CompararCliente';

export const dynamic = 'force-dynamic';

async function cargar() {
  const supabase = crearClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: sups } = await supabase
    .from('supervisiones')
    .select('id, nombre_cprs, fecha_hora_supervision, promedio_general, estado')
    .eq('estado', 'finalizado')
    .order('fecha_hora_supervision', { ascending: true });

  const supIds = (sups || []).map((s) => s.id);
  let rubros = [];
  if (supIds.length > 0) {
    const { data } = await supabase
      .from('rubros')
      .select('id, supervision_id, rubro_catalog_id, nombre, orden, no_aplica, calificacion')
      .in('supervision_id', supIds);
    rubros = data || [];
  }

  const rubrosPorSup = {};
  for (const r of rubros) {
    if (!rubrosPorSup[r.supervision_id]) rubrosPorSup[r.supervision_id] = [];
    rubrosPorSup[r.supervision_id].push(r);
  }

  const centrosDisponibles = Array.from(new Set((sups || []).map((s) => s.nombre_cprs))).sort();

  return { user, centrosDisponibles, todasSups: sups || [], rubrosPorSup };
}

export default async function CompararPage() {
  const { user, centrosDisponibles, todasSups, rubrosPorSup } = await cargar();

  return (
    <>
      <Header email={user?.email} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Comparar centros</h1>
        <p className="text-gray-500 mb-6">Selecciona hasta 7 C.P.R.S. para comparar su evolución y desempeño por rubro.</p>
        <CompararCliente
          centrosDisponibles={centrosDisponibles}
          todasSups={todasSups}
          rubrosPorSup={rubrosPorSup}
        />
      </main>
    </>
  );
}
