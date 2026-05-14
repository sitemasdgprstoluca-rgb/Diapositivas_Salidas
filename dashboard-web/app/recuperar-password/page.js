'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, ArrowLeft, MailCheck, AlertTriangle } from 'lucide-react';

import { crearClienteNavegador } from '../../lib/supabase-browser';
import AuthShell from '../../components/auth/AuthShell';
import AuthInput from '../../components/auth/AuthInput';
import AuthSubmit from '../../components/auth/AuthSubmit';

export default function RecuperarPasswordPage() {
  const supabase = crearClienteNavegador();

  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldError('');

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setFieldError('Ingresa tu correo electrónico.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setFieldError('Formato de correo no válido.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo:
        typeof window !== 'undefined'
          ? `${window.location.origin}/cambiar-password`
          : undefined,
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setEnviado(true);
  };

  return (
    <AuthShell
      title={enviado ? 'Revisa tu correo' : 'Recuperar contraseña'}
      subtitle={
        enviado
          ? 'Te enviamos las instrucciones para restablecer tu acceso.'
          : 'Ingresa tu correo institucional. Recibirás un enlace seguro para crear una nueva contraseña.'
      }
    >
      <AnimatePresence mode="wait">
        {!enviado ? (
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
              icon={<Mail size={16} strokeWidth={2.2} />}
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldError) setFieldError('');
              }}
              placeholder="usuario@institucion.gob.mx"
              autoComplete="email"
              autoFocus
              required
              error={fieldError}
            />

            <AuthSubmit loading={loading} icon={<Send size={16} strokeWidth={2.4} />}>
              Enviar enlace
            </AuthSubmit>

            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#9F2241] hover:text-[#5C2E37] transition pt-1"
            >
              <ArrowLeft size={14} strokeWidth={2.4} /> Volver al inicio de sesión
            </Link>
          </motion.form>
        ) : (
          <motion.div
            key="enviado"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="text-center"
          >
            <motion.div
              initial={{ rotate: -10, scale: 0.7 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
              className="relative mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-5"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                boxShadow: '0 16px 40px -8px rgba(16,185,129,0.55)',
              }}
            >
              <MailCheck size={36} strokeWidth={2.2} className="text-white" />
              <span
                aria-hidden
                className="absolute inset-0 rounded-full animate-ping"
                style={{ background: 'rgba(16,185,129,0.30)' }}
              />
            </motion.div>

            <p className="text-sm text-[#475569] leading-relaxed">
              Si <span className="font-bold text-[#0f172a]">{email}</span> está registrado,
              recibirás un enlace para crear una nueva contraseña.
            </p>
            <p className="text-xs text-[#94a3b8] mt-2">
              Revisa también la carpeta de spam · El enlace expira en 60 minutos.
            </p>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 mt-6 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition"
              style={{
                background: 'linear-gradient(135deg, #9F2241 0%, #5C2E37 100%)',
                boxShadow: '0 8px 24px -6px rgba(159,34,65,0.50)',
              }}
            >
              <ArrowLeft size={14} strokeWidth={2.4} /> Volver al inicio de sesión
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
