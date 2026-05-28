'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#0a0a0a',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 16px',
      overflow: 'hidden'
    }}>
      {/* Background Glows and Grid */}
      <div style={{
        position: 'absolute',
        top: '-200px',
        left: '-200px',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(245,197,24,0.12) 0%, rgba(245,197,24,0.04) 40%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-200px',
        right: '-200px',
        width: '700px',
        height: '700px',
        background: 'radial-gradient(circle, rgba(245,197,24,0.08) 0%, transparent 65%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Login Box */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: '#161616',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        padding: '40px 32px',
        position: 'relative',
        zIndex: 10,
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        animation: 'fadeIn 0.5s ease-out forwards',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '26px',
            color: '#f5c518',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Risada Film
          </h1>
          <p style={{
            fontSize: '11px',
            color: '#888',
            marginTop: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}>
            Área Administrativa
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#888',
              marginBottom: '8px',
              fontWeight: 500,
            }}>
              Email
            </label>
            <input
              suppressHydrationWarning
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                background: '#111111',
                border: '1px solid #2a2a2a',
                borderRadius: '6px',
                padding: '12px 14px',
                fontSize: '14px',
                color: '#f0f0f0',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#f5c518'}
              onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
              placeholder="admin@risadafilm.com.br"
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#888',
              marginBottom: '8px',
              fontWeight: 500,
            }}>
              Senha
            </label>
            <input
              suppressHydrationWarning
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                background: '#111111',
                border: '1px solid #2a2a2a',
                borderRadius: '6px',
                padding: '12px 14px',
                fontSize: '14px',
                color: '#f0f0f0',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#f5c518'}
              onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p style={{ color: '#e53e3e', fontSize: '13px', margin: 0, fontWeight: 500 }}>
              {error}
            </p>
          )}

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#f5c518',
              color: '#111',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '14px',
              padding: '14px',
              borderRadius: '6px',
              border: 'none',
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: '8px',
              transition: 'background 0.2s, transform 0.1s',
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#e0b213')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#f5c518')}
            onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
