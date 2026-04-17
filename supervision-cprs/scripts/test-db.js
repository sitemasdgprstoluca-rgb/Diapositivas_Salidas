/* eslint-disable */
/**
 * Suite de pruebas contra la base de datos en vivo.
 * Crea 2 usuarios de prueba en transacciones aisladas (ROLLBACK),
 * así que no queda basura en auth.users.
 */
const { Client } = require('pg');

const CONFIG = {
  host: 'aws-1-us-west-2.pooler.supabase.com',
  port: 5432,
  user: 'postgres.rtbbtnqttxmqzlwagays',
  password: 'qrY5$VN!2#?upcQ',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
};

let passed = 0;
let failed = 0;
const errors = [];

const test = async (name, fn) => {
  try {
    await fn();
    console.log('  ✓', name);
    passed++;
  } catch (e) {
    console.log('  ✗', name, '→', e.message);
    errors.push({ name, error: e.message });
    failed++;
  }
};

const expectEq = (actual, expected, label) => {
  if (actual !== expected) {
    throw new Error(`${label || ''} esperaba ${JSON.stringify(expected)}, recibió ${JSON.stringify(actual)}`);
  }
};
const expectContains = (arr, item, label) => {
  if (!arr.includes(item)) {
    throw new Error(`${label || ''} no contiene "${item}". Tiene: [${arr.join(', ')}]`);
  }
};

/**
 * Inserta un usuario mínimo en auth.users dentro de la transacción actual.
 * Retorna el uuid. Se esperará ROLLBACK después.
 */
async function crearUsuarioEnTx(c, email) {
  const r = await c.query(`
    insert into auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    values (
      '00000000-0000-0000-0000-000000000000'::uuid,
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      $1,
      crypt('testpassword', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(), now(),
      '', '', '', ''
    )
    returning id
  `, [email]);
  return r.rows[0].id;
}

(async () => {
  const c = new Client(CONFIG);
  await c.connect();

  console.log('\n=== 1) ESQUEMA DE TABLAS ===');

  await test('Tabla admins existe', async () => {
    const r = await c.query("select column_name from information_schema.columns where table_schema='public' and table_name='admins'");
    const cols = r.rows.map(r => r.column_name);
    expectContains(cols, 'user_id');
    expectContains(cols, 'fecha_creacion');
    expectContains(cols, 'notas');
  });

  await test('Tabla supervisiones tiene columnas esperadas', async () => {
    const r = await c.query("select column_name from information_schema.columns where table_schema='public' and table_name='supervisiones'");
    const cols = r.rows.map(r => r.column_name);
    ['id', 'user_id', 'estado', 'nombre_cprs', 'fecha_hora_supervision', 'promedio_general', 'fecha_creacion', 'fecha_modificacion'].forEach(
      col => expectContains(cols, col)
    );
  });

  await test('Tabla rubros tiene columnas esperadas', async () => {
    const r = await c.query("select column_name from information_schema.columns where table_schema='public' and table_name='rubros'");
    const cols = r.rows.map(r => r.column_name);
    ['id', 'supervision_id', 'rubro_catalog_id', 'nombre', 'orden', 'no_aplica', 'calificacion', 'observacion', 'sin_novedad'].forEach(
      col => expectContains(cols, col)
    );
  });

  await test('Tabla criterios_rubro tiene columnas esperadas', async () => {
    const r = await c.query("select column_name from information_schema.columns where table_schema='public' and table_name='criterios_rubro'");
    const cols = r.rows.map(r => r.column_name);
    ['id', 'rubro_id', 'criterio_catalog_id', 'texto', 'cumple', 'orden'].forEach(col => expectContains(cols, col));
  });

  await test('Tabla fotos_rubro tiene columnas esperadas', async () => {
    const r = await c.query("select column_name from information_schema.columns where table_schema='public' and table_name='fotos_rubro'");
    const cols = r.rows.map(r => r.column_name);
    ['id', 'rubro_id', 'storage_path', 'orden'].forEach(col => expectContains(cols, col));
  });

  console.log('\n=== 2) CONSTRAINTS ===');

  await test('Estado solo acepta borrador|finalizado', async () => {
    await c.query('begin;');
    try {
      const uid = await crearUsuarioEnTx(c, `test-estado-${Date.now()}@test.local`);
      await c.query("insert into public.supervisiones(user_id, estado) values ($1, 'invalido');", [uid]);
      await c.query('rollback;');
      throw new Error('Debería haber fallado');
    } catch (e) {
      await c.query('rollback;').catch(() => {});
      if (!String(e.message).match(/violates check|check constraint|estado_check/i)) throw e;
    }
  });

  await test('Calificación <1 o >10 es rechazada', async () => {
    await c.query('begin;');
    try {
      const uid = await crearUsuarioEnTx(c, `test-cal-${Date.now()}@test.local`);
      const sup = await c.query("insert into public.supervisiones(user_id, estado, nombre_cprs) values ($1, 'borrador', 'T') returning id", [uid]);
      await c.query("insert into public.rubros(supervision_id, rubro_catalog_id, nombre, orden, calificacion) values ($1, 'test', 't', 1, 15)", [sup.rows[0].id]);
      await c.query('rollback;');
      throw new Error('Debería haber fallado con calificación 15');
    } catch (e) {
      await c.query('rollback;').catch(() => {});
      if (!String(e.message).match(/violates check|calificacion/i)) throw e;
    }
  });

  await test('Calificación nula con no_aplica=true es permitida', async () => {
    await c.query('begin;');
    const uid = await crearUsuarioEnTx(c, `test-napa-${Date.now()}@test.local`);
    const sup = await c.query("insert into public.supervisiones(user_id, estado, nombre_cprs) values ($1, 'borrador', 'T') returning id", [uid]);
    await c.query(
      "insert into public.rubros(supervision_id, rubro_catalog_id, nombre, orden, no_aplica, calificacion) values ($1, 'test', 't', 1, true, null)",
      [sup.rows[0].id]
    );
    await c.query('rollback;');
  });

  await test('Calificación entera 1-10 es aceptada', async () => {
    await c.query('begin;');
    const uid = await crearUsuarioEnTx(c, `test-ok-${Date.now()}@test.local`);
    const sup = await c.query("insert into public.supervisiones(user_id, estado, nombre_cprs) values ($1, 'borrador', 'T') returning id", [uid]);
    for (const n of [1, 5, 10]) {
      await c.query(
        "insert into public.rubros(supervision_id, rubro_catalog_id, nombre, orden, calificacion) values ($1, $2, 't', 1, $3)",
        [sup.rows[0].id, 'cal' + n, n]
      );
    }
    await c.query('rollback;');
  });

  console.log('\n=== 3) CASCADAS Y TRIGGERS ===');

  await test('Cascade: borrar supervisión borra rubros y criterios', async () => {
    await c.query('begin;');
    const uid = await crearUsuarioEnTx(c, `test-cas-${Date.now()}@test.local`);
    const sup = await c.query("insert into public.supervisiones(user_id, estado, nombre_cprs) values ($1, 'borrador', 'T') returning id", [uid]);
    const supId = sup.rows[0].id;
    const rub = await c.query(
      "insert into public.rubros(supervision_id, rubro_catalog_id, nombre, orden, calificacion) values ($1, 'x', 't', 1, 5) returning id",
      [supId]
    );
    const rubId = rub.rows[0].id;
    await c.query("insert into public.criterios_rubro(rubro_id, criterio_catalog_id, texto, cumple) values ($1, 'c', 't', true)", [rubId]);
    await c.query("insert into public.fotos_rubro(rubro_id, storage_path, orden) values ($1, 'fake/path.jpg', 0)", [rubId]);

    const antes = await c.query('select (select count(*) from public.rubros where supervision_id=$1) as r, (select count(*) from public.criterios_rubro where rubro_id=$2) as cr, (select count(*) from public.fotos_rubro where rubro_id=$2) as f', [supId, rubId]);
    expectEq(Number(antes.rows[0].r), 1, 'rubros antes');
    expectEq(Number(antes.rows[0].cr), 1, 'criterios antes');
    expectEq(Number(antes.rows[0].f), 1, 'fotos antes');

    await c.query('delete from public.supervisiones where id=$1', [supId]);

    const despues = await c.query('select (select count(*) from public.rubros where supervision_id=$1) as r, (select count(*) from public.criterios_rubro where rubro_id=$2) as cr, (select count(*) from public.fotos_rubro where rubro_id=$2) as f', [supId, rubId]);
    expectEq(Number(despues.rows[0].r), 0, 'rubros deben borrarse cascade');
    expectEq(Number(despues.rows[0].cr), 0, 'criterios deben borrarse cascade');
    expectEq(Number(despues.rows[0].f), 0, 'fotos deben borrarse cascade');
    await c.query('rollback;');
  });

  await test('Trigger: fecha_modificacion se actualiza en UPDATE', async () => {
    // Usamos 2 transacciones separadas porque now() es transaction_timestamp()
    // y no avanza dentro de la misma TX. La tercera limpia la supervisión creada.
    await c.query('begin;');
    const uid = await crearUsuarioEnTx(c, `test-trg-${Date.now()}@test.local`);
    // Guardar el user como admin temporal no es necesario; commit de user solo.
    // Pero hacer rollback del user haría que el UPDATE falle por FK.
    // Mejor: creamos el usuario y supervisión en TX1, commit; UPDATE en TX2; DELETE al final.
    const sup = await c.query(
      "insert into public.supervisiones(user_id, estado, nombre_cprs) values ($1, 'borrador', 'TEST_TRG') returning id, fecha_modificacion",
      [uid]
    );
    const supId = sup.rows[0].id;
    const fmOriginal = sup.rows[0].fecha_modificacion;
    await c.query('commit;');

    // Sleep wallclock + nueva TX
    await new Promise(r => setTimeout(r, 250));

    try {
      const upd = await c.query(
        "update public.supervisiones set nombre_cprs='TEST_TRG_UPD' where id=$1 returning fecha_modificacion",
        [supId]
      );
      const fmNueva = upd.rows[0].fecha_modificacion;

      if (new Date(fmNueva) <= new Date(fmOriginal)) {
        throw new Error(`fecha_modificacion no avanzó: ${fmOriginal} -> ${fmNueva}`);
      }
    } finally {
      // Limpieza: borrar supervisión y usuario
      await c.query('delete from public.supervisiones where id=$1', [supId]).catch(() => {});
      await c.query('delete from auth.users where id=$1', [uid]).catch(() => {});
    }
  });

  console.log('\n=== 4) RLS Y FUNCIÓN es_admin() ===');

  await test('Función es_admin() existe', async () => {
    const r = await c.query("select proname from pg_proc where proname='es_admin'");
    if (r.rows.length === 0) throw new Error('Función no existe');
  });

  await test('Número de políticas RLS completo (>=20)', async () => {
    const r = await c.query(`
      select count(*) from pg_policies where schemaname='public'
      and tablename in ('admins','supervisiones','rubros','criterios_rubro','fotos_rubro')
    `);
    const n = Number(r.rows[0].count);
    if (n < 20) throw new Error(`Solo ${n} políticas, se esperan >=20`);
  });

  await test('RLS: usuario NO admin NO ve supervisiones de otros', async () => {
    await c.query('begin;');
    const uidA = await crearUsuarioEnTx(c, `test-rls-a-${Date.now()}@test.local`);
    const uidB = await crearUsuarioEnTx(c, `test-rls-b-${Date.now()}@test.local`);
    await c.query("insert into public.supervisiones(user_id, estado, nombre_cprs) values ($1, 'borrador', 'RLS_A')", [uidA]);
    await c.query("insert into public.supervisiones(user_id, estado, nombre_cprs) values ($1, 'borrador', 'RLS_B')", [uidB]);

    // Impersonar uidA como authenticated (no admin)
    await c.query("set local role authenticated");
    await c.query(`set local request.jwt.claim.sub = '${uidA}'`);

    const r = await c.query("select nombre_cprs from public.supervisiones where nombre_cprs in ('RLS_A','RLS_B')");
    const nombres = r.rows.map(x => x.nombre_cprs);

    await c.query('rollback;');

    if (nombres.includes('RLS_B')) throw new Error(`UserA logró ver RLS_B (RLS roto)`);
    if (!nombres.includes('RLS_A')) throw new Error(`UserA no ve su propia RLS_A`);
  });

  await test('RLS: usuario ADMIN ve supervisiones de TODOS', async () => {
    await c.query('begin;');
    const uidA = await crearUsuarioEnTx(c, `test-adm-a-${Date.now()}@test.local`);
    const uidB = await crearUsuarioEnTx(c, `test-adm-b-${Date.now()}@test.local`);
    await c.query("insert into public.supervisiones(user_id, estado, nombre_cprs) values ($1, 'borrador', 'ADM_A')", [uidA]);
    await c.query("insert into public.supervisiones(user_id, estado, nombre_cprs) values ($1, 'borrador', 'ADM_B')", [uidB]);
    await c.query("insert into public.admins(user_id, notas) values ($1, 'test')", [uidA]);

    await c.query("set local role authenticated");
    await c.query(`set local request.jwt.claim.sub = '${uidA}'`);

    const r = await c.query("select nombre_cprs from public.supervisiones where nombre_cprs in ('ADM_A','ADM_B') order by nombre_cprs");
    const nombres = r.rows.map(x => x.nombre_cprs);

    await c.query('rollback;');

    if (!nombres.includes('ADM_A')) throw new Error('Admin no ve ADM_A');
    if (!nombres.includes('ADM_B')) throw new Error('Admin no ve ADM_B (gate roto)');
  });

  await test('RLS: usuario no admin NO puede insertar como admin en tabla admins', async () => {
    await c.query('begin;');
    const uid = await crearUsuarioEnTx(c, `test-admlock-${Date.now()}@test.local`);

    await c.query("set local role authenticated");
    await c.query(`set local request.jwt.claim.sub = '${uid}'`);

    try {
      await c.query("insert into public.admins(user_id) values ($1)", [uid]);
      await c.query('rollback;');
      throw new Error('Un no-admin logró insertar en admins (RLS roto)');
    } catch (e) {
      await c.query('rollback;').catch(() => {});
      if (!String(e.message).match(/violates row-level|policy/i)) throw e;
    }
  });

  console.log('\n=== 5) STORAGE BUCKET ===');

  await test('Bucket supervisiones-fotos existe y es privado', async () => {
    const r = await c.query("select id, public from storage.buckets where id='supervisiones-fotos'");
    if (r.rows.length === 0) throw new Error('Bucket no existe');
    if (r.rows[0].public) throw new Error('Bucket debe ser privado');
  });

  await test('Bucket tiene las 4 políticas (select/insert/update/delete)', async () => {
    const r = await c.query("select policyname from pg_policies where tablename='objects' and policyname like 'fotos_storage_%'");
    const names = r.rows.map(x => x.policyname);
    ['fotos_storage_select', 'fotos_storage_insert', 'fotos_storage_update', 'fotos_storage_delete'].forEach(
      p => expectContains(names, p)
    );
  });

  console.log('\n=== 6) INDICES ===');

  await test('Índices críticos existen', async () => {
    const r = await c.query(`
      select indexname from pg_indexes
      where schemaname='public' and tablename in ('supervisiones','rubros','criterios_rubro','fotos_rubro')
    `);
    const names = r.rows.map(x => x.indexname);
    expectContains(names, 'idx_supervisiones_user_id');
    expectContains(names, 'idx_rubros_supervision_id');
    expectContains(names, 'idx_criterios_rubro_id');
    expectContains(names, 'idx_fotos_rubro_id');
  });

  await c.end();

  console.log('\n=== RESULTADO ===');
  console.log(`Pasaron: ${passed}   Fallaron: ${failed}`);
  if (failed > 0) {
    console.log('\nFallos:');
    errors.forEach(e => console.log(' -', e.name, ':', e.error));
    process.exit(1);
  }
})().catch((e) => {
  console.error('ERROR FATAL:', e);
  process.exit(2);
});
