'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, AlertTriangle } from 'lucide-react';

import { crearClienteNavegador } from '../../lib/supabase-browser';
import AuthShell from '../../components/auth/AuthShell';
import AuthInput from '../../components/auth/AuthInput';
import AuthSubmit from '../../components/auth/AuthSubmit';

export default function LoginPage() {
  const router = useRouter();
  const supabase = crearClienteNavegador();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = { email: '', password: '' };
    if (!email.trim()) errs.email = 'Ingresa tu correo electrónico.';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) errs.email = 'Formato de correo no válido.';
    if (!password) errs.password = 'La contraseña es obligatoria.';
    else if (password.length < 6) errs.password = 'Mínimo 6 caracteres.';
    setFieldErrors(errs);
    return !errs.email && !errs.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validate()) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);

    if (error) {
      setErrorMsg(
        error.message === 'Invalid login credentials'
          ? 'Usuario o contraseña incorrectos.'
          : error.message
      );
      return;
    }

    router.push('/');
    router.refresh();
  };

  return (
    <AuthShell
      title="Iniciar Sesión"
      subtitle="Accede al panel institucional con tu cuenta autorizada."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
          icon={<Mail size={16} strokeWidth={2.2} />}
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: '' }));
          }}
          placeholder="usuario@institucion.gob.mx"
          autoComplete="username"
          autoFocus
          required
          error={fieldErrors.email}
        />

        <AuthInput
          icon={<Lock size={16} strokeWidth={2.2} />}
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: '' }));
          }}
          placeholder="••••••••••"
          autoComplete="current-password"
          required
          error={fieldErrors.password}
        />

        <div className="flex justify-end -mt-1">
          <Link
            href="/recuperar-password"
            className="text-xs font-bold text-[#9F2241] hover:text-[#5C2E37] transition underline-offset-4 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <AuthSubmit loading={loading} icon={<LogIn size={16} strokeWidth={2.4} />}>
          Iniciar sesión
        </AuthSubmit>

        <p className="text-center text-[10px] text-[#94a3b8] pt-2">
          Conexión segura · Cifrado TLS
        </p>
      </form>
    </AuthShell>
  );
}
