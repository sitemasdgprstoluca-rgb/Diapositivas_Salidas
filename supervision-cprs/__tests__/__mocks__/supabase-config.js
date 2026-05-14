// Mock de src/config/supabase.js para Jest.
// Evita el error "Unexpected token 'export'" causado por ESM en ese módulo.
module.exports = {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
  SUPABASE_BUCKET_FOTOS: 'supervisiones-fotos',
  supabaseEstaConfigurado: () => false,
};
