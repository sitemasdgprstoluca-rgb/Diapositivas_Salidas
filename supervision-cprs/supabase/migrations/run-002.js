// Runner one-shot para la migración 002_cprs_centros.sql
// Uso: PGPASSWORD=xxx node supabase/migrations/run-002.js
// Conecta vía pooler (IPv4) y ejecuta SOLO el archivo 002.
// NO toca ninguna tabla del sistema farmacia que coexiste en este schema.

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const sql = fs.readFileSync(
  path.join(__dirname, '002_cprs_centros.sql'),
  'utf8'
);

const password = process.env.PGPASSWORD;
if (!password) {
  console.error('ERROR: PGPASSWORD no definido. Aborting.');
  process.exit(1);
}

const client = new Client({
  host: 'aws-0-us-west-2.pooler.supabase.com',
  port: 5432,
  user: 'postgres.lczetjzlooguihcokbim',
  password,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    await client.connect();
    console.log('[OK] Conectado al pooler');

    // Verificar que SOLO vamos a tocar cprs_centros, no nada de farmacia
    if (!/cprs_centros/.test(sql)) {
      throw new Error('SAFETY CHECK: el SQL no contiene "cprs_centros"');
    }
    if (/lotes|productos|dispensaciones|pacientes|tratamientos|django_/i.test(sql)) {
      throw new Error('SAFETY CHECK: el SQL menciona tablas de farmacia');
    }

    console.log('[OK] Safety checks OK, ejecutando migración...');
    await client.query(sql);
    console.log('[OK] Migración aplicada');

    // Verificación: contar centros
    const r = await client.query(
      'select count(*)::int as n from public.cprs_centros'
    );
    console.log(`[OK] cprs_centros tiene ${r.rows[0].n} filas`);
  } catch (err) {
    console.error('[FAIL]', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
