import { crearClienteServidor } from '../../lib/supabase-server';
import Header from '../../components/Header';
import CompararCliente from '../../components/CompararCliente';
import { IconAntenna } from '../../components/ui/icons';

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

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Título institucional */}
        <div className="mb-10 animate-slide-up">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-block w-10 h-0.5 bg-gradient-to-r from-transparent via-dorado-500 to-dorado-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-dorado-300">
              IA · Tiempo real · Proyección
            </span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-none">
            <span className="text-white">Comparar </span>
            <span className="text-gradient-gold">Centros</span>
          </h1>
          <p className="text-white/65 text-lg mt-4 max-w-2xl leading-relaxed">
            Analítica cruzada con detección de patrones, evolución vs visitas anteriores
            y proyección por regresión lineal.
          </p>
        </div>

        {centrosDisponibles.length === 0 ? (
          <div className="inst-card-dark p-16 text-center">
            <div className="text-dorado-300/70 mb-5 flex justify-center">
              <IconAntenna width={56} height={56} />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Aún no hay datos</h2>
            <p className="text-white/55 text-base max-w-md mx-auto">
              Cuando los supervisores finalicen supervisiones desde la app móvil,
              aquí verás analítica en vivo con insights de IA, evolución temporal y proyecciones.
            </p>
          </div>
        ) : (
          <CompararCliente
            centrosDisponibles={centrosDisponibles}
            todasSups={todasSups}
            rubrosPorSup={rubrosPorSup}
          />
        )}
      </main>
    </>
  );
}
