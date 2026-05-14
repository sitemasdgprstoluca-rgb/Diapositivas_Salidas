'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';

import { crearClienteNavegador } from '../../lib/supabase-browser';
import AuthShell from '../../components/auth/AuthShell';
import AuthInput from '../../components/auth/AuthInput';
import AuthSubmit from '../../components/auth/AuthSubmit';

export default function CambiarPasswordPage() {
  const router = useRouter();
  const supabase = crearClienteNavegador();

  const [pwd, setPwd] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ pwd: '', pwdConfirm: '' });
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);

  const validate = () => {
    const errs = { pwd: '', pwdConfirm: '' };
    if (!pwd) errs.pwd = 'Ingresa una nueva contraseña.';
    else if (pwd.length < 6) errs.pwd = 'Mínimo 6 caracteres.';
    if (!pwdConfirm) errs.pwdConfirm = 'Confirma la contraseña.';
    else if (pwd !== pwdConfirm) errs.pwdConfirm = 'Las contraseñas no coinciden.';
    setFieldErrors(errs);
    return !errs.pwd && !errs.pwdConfirm;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validate()) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setExito(true);
    setTimeout(() => {
      router.push('/');
      router.refresh();
    }, 1900);
  };

  return (
    <AuthShell
      title={exito ? 'Contraseña actualizada' : 'Cambiar contraseña'}
      subtitle={
        exito
          ? 'Tus credenciales se actualizaron correctamente. Te llevamos al panel…'
          : 'Crea una nueva contraseña segura. Recomendamos combinar mayúsculas, números y símbolos.'
      }
    >
      <AnimatePresence mode="wait">
        {!exito ? (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
            noValidate
          >
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{
                    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                    border: '1px solid #fca5a5',
                  }}
                >
                  <span className="w-8 h-8 rounded-full bg-[#dc2626] text-white flex items-center justify-center shrink-0">
                    <AlertTriangle size={16} strokeWidth={2.4} />
                  </span>
                  <p className="text-sm text-[#991b1b] font-semibold">{errorMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AuthInput
              icon={<Lock size={16} strokeWidth={2.2} />}
              label="Nueva contraseña"
              type="password"
              value={pwd}
              onChange={(e) => {
                setPwd(e.target.value);
                if (fieldErrors.pwd) setFieldErrors((f) => ({ ...f, pwd: '' }));
              }}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              autoFocus
              required
              showStrength
              error={fieldErrors.pwd}
            />

            <AuthInput
              icon={<ShieldCheck size={16} strokeWidth={2.2} />}
              label="Confirmar contraseña"
              type="password"
              value={pwdConfirm}
              onChange={(e) => {
                setPwdConfirm(e.target.value);
                if (fieldErrors.pwdConfirm) setFieldErrors((f) => ({ ...f, pwdConfirm: '' }));
              }}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
              required
              error={fieldErrors.pwdConfirm}
            />

            {/* Match indicator */}
            {pwd && pwdConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center gap-2 text-xs font-bold ${
                  pwd === pwdConfirm ? 'text-[#10b981]' : 'text-[#dc2626]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    pwd === pwdConfirm ? 'bg-[#10b981]' : 'bg-[#dc2626]'
                  }`}
                />
                {pwd === pwdConfirm ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
              </motion.div>
            )}

            <AuthSubmit
              loading={loading}
              icon={<ShieldCheck size={16} strokeWidth={2.4} />}
            >
              Actualizar contraseña
            </AuthSubmit>

            <Link
              href="/"
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#9F2241] hover:text-[#5C2E37] transition pt-1"
            >
              <ArrowLeft size={14} strokeWidth={2.4} /> Volver al panel
            </Link>
          </motion.form>
        ) : (
          <motion.div
            key="exito"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="text-center"
          >
            <motion.div
              initial={{ rotate: -12, scale: 0.6 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.1 }}
              className="relative mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-5"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                boxShadow: '0 16px 40px -8px rgba(16,185,129,0.55)',
              }}
            >
              <CheckCircle2 size={40} strokeWidth={2.2} className="text-white" />
              <span
                aria-hidden
                className="absolute inset-0 rounded-full animate-ping"
                style={{ background: 'rgba(16,185,129,0.30)' }}
              />
            </motion.div>
            <p className="text-sm text-[#475569]">
              Redirigiéndote al panel institucional…
            </p>
            <div className="mt-5 mx-auto h-1 w-32 rounded-full bg-[#e2e8f0] overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#10b981] to-[#047857]"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.8, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
