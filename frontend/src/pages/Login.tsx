import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';

type ViewState = 'login' | 'forgot-password' | 'verify-code' | 'reset-password';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading, error, clearError, isAuthenticated } = useAuthStore();

  const [viewState, setViewState] = useState<ViewState>('login');
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; code?: string; newPassword?: string; confirmPassword?: string }>({});
  const [touched, setTouched] = useState({ email: false, password: false, code: false, newPassword: false, confirmPassword: false });
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const clearMessages = () => {
    if (error) clearError();
    setLocalError('');
    setSuccessMessage('');
  };

  const validateLoginForm = (): boolean => {
    const newErrors: any = {};
    if (!email) newErrors.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email inválido';
    if (!password) newErrors.password = 'Senha é obrigatória';
    else if (password.length < 8) newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: 'email' | 'password' | 'code' | 'newPassword' | 'confirmPassword') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    // Validação inline poderia ir aqui, mas vamos manter simples por agora
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!validateLoginForm()) return;
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch {
      // error is already in store
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldErrors({ email: 'Email inválido' });
      return;
    }
    setLocalLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccessMessage('Código enviado para o seu e-mail. Verifique sua caixa de entrada.');
      setViewState('verify-code');
    } catch (err: any) {
      setLocalError('Erro ao solicitar código. Verifique se o e-mail está correto e cadastrado.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const newErrors: any = {};
    if (!code) newErrors.code = 'Código é obrigatório';
    setFieldErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) return;

    setLocalLoading(true);
    try {
      await authService.verifyCode(email, code);
      setSuccessMessage('Código validado! Agora você pode criar sua nova senha.');
      setViewState('reset-password');
    } catch (err: any) {
      setLocalError('Código inválido ou expirado.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const newErrors: any = {};
    if (!newPassword || newPassword.length < 8) newErrors.newPassword = 'A nova senha deve ter pelo menos 8 caracteres';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem';
    setFieldErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) return;

    setLocalLoading(true);
    try {
      await authService.resetPassword(email, code, newPassword);
      setSuccessMessage('Senha alterada com sucesso! Você já pode fazer o login.');
      setViewState('login');
      setPassword('');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setLocalError('Erro ao redefinir a senha. O código pode ser inválido ou já ter expirado.');
    } finally {
      setLocalLoading(false);
    }
  };

  const loading = authLoading || localLoading;
  const displayError = error || localError;

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 font-sans">
      <div className="bg-white flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-4 mb-10">
            <div className="text-[#3b0764] flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.5a.75.75 0 0 1 .71.51l.8 2.22A7.95 7.95 0 0 1 16.35 7l2.12-.9a.75.75 0 0 1 .84.18l2.12 2.12a.75.75 0 0 1 .18.84l-.9 2.12a7.95 7.95 0 0 1 1.77 2.84l2.22.8a.75.75 0 0 1 .51.71v3a.75.75 0 0 1-.51.71l-2.22.8a7.95 7.95 0 0 1-1.77 2.84l.9 2.12a.75.75 0 0 1-.18.84l-2.12 2.12a.75.75 0 0 1-.84.18l-2.12-.9a7.95 7.95 0 0 1-2.84 1.77l-.8 2.22a.75.75 0 0 1-.71.51h-3a.75.75 0 0 1-.71-.51l-.8-2.22a7.95 7.95 0 0 1-2.84-1.77l-2.12.9a.75.75 0 0 1-.84-.18l-2.12-2.12a.75.75 0 0 1-.18-.84l.9-2.12a7.95 7.95 0 0 1-1.77-2.84l-2.22-.8a.75.75 0 0 1-.51-.71v-3a.75.75 0 0 1 .51-.71l2.22-.8a7.95 7.95 0 0 1 1.77-2.84l-.9-2.12a.75.75 0 0 1 .18-.84l2.12-2.12a.75.75 0 0 1 .84-.18l2.12.9A7.95 7.95 0 0 1 10.49 5.23l.8-2.22a.75.75 0 0 1 .71-.51h3ZM12 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-4 9.5c0-1.8 2-3 4-3s4 1.2 4 3v1H8v-1Z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-[#3b0764] tracking-wide">SIAOA</h1>
            </div>
          </div>

          {displayError && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-sm flex items-start gap-2">
              <svg className="mt-0.5 shrink-0" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>{displayError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded-lg text-green-800 text-sm flex items-start gap-2">
              <svg className="mt-0.5 shrink-0" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {viewState === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-500 mb-1 ml-1">E-Mail</label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                    onBlur={() => handleBlur('email')}
                    className={`w-full pr-14 pl-4 py-3 bg-[#f8f9fa] border-none rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      touched.email && fieldErrors.email ? 'ring-2 ring-red-500' : 'focus:ring-[#6f21e8]'
                    }`}
                    placeholder="alex@email.com"
                    disabled={loading}
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2">
                    <div className="w-10 h-10 bg-[#6f21e8] rounded-md flex items-center justify-center text-white">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-500 mb-1 ml-1">Senha</label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
                    onBlur={() => handleBlur('password')}
                    className={`w-full pr-14 pl-4 py-3 bg-[#f8f9fa] border-none rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      touched.password && fieldErrors.password ? 'ring-2 ring-red-500' : 'focus:ring-[#6f21e8]'
                    }`}
                    placeholder="Insira sua senha"
                    disabled={loading}
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2">
                    <div className="w-10 h-10 bg-[#6f21e8] rounded-md flex items-center justify-center text-white">
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                {fieldErrors.password && <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>}
              </div>

              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => { setViewState('forgot-password'); clearMessages(); }}
                  className="text-sm text-[#6f21e8] font-semibold underline decoration-[#6f21e8] underline-offset-4 hover:brightness-110"
                >
                  Esqueceu sua senha?
                </button>
              </div>

              <Button type="submit" className="w-full bg-[#6f21e8] hover:bg-[#5b15cc] text-white py-6 mt-4 rounded-lg text-lg font-medium" disabled={loading}>
                {loading ? 'Entrando...' : 'Login'}
              </Button>
            </form>
          )}

          {viewState === 'forgot-password' && (
            <form onSubmit={handleForgotSubmit} className="space-y-5">
              <p className="text-gray-600 text-sm">Digite seu e-mail para receber um código de recuperação.</p>
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-500 mb-1 ml-1">E-Mail</label>
                <div className="relative">
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                    className={`w-full pr-4 pl-4 py-3 bg-[#f8f9fa] border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f21e8] transition-colors`}
                    placeholder="alex@email.com"
                    disabled={loading}
                  />
                </div>
                {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
              </div>

              <Button type="submit" className="w-full bg-[#6f21e8] hover:bg-[#5b15cc] text-white py-6 mt-4 rounded-lg text-lg font-medium" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Código'}
              </Button>

              <div className="text-center mt-4">
                <button 
                  type="button" 
                  onClick={() => { setViewState('login'); clearMessages(); }}
                  className="text-sm text-gray-500 hover:text-gray-800"
                >
                  Voltar para o Login
                </button>
              </div>
            </form>
          )}

          {viewState === 'verify-code' && (
            <form onSubmit={handleVerifySubmit} className="space-y-5">
              <p className="text-gray-600 text-sm">Um código de 6 dígitos foi enviado para <span className="font-semibold">{email}</span>.</p>
              
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-500 mb-1 ml-1">Código de Recuperação</label>
                <input
                  id="code"
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => { setCode(e.target.value); clearMessages(); }}
                  className={`w-full pr-4 pl-4 py-3 bg-[#f8f9fa] border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f21e8] transition-colors font-mono text-center tracking-[0.5em] text-lg`}
                  placeholder="000000"
                  disabled={loading}
                />
                {fieldErrors.code && <p className="mt-1 text-sm text-red-600">{fieldErrors.code}</p>}
              </div>

              <Button type="submit" className="w-full bg-[#6f21e8] hover:bg-[#5b15cc] text-white py-6 mt-4 rounded-lg text-lg font-medium" disabled={loading}>
                {loading ? 'Verificando...' : 'Verificar Código'}
              </Button>
              
              <div className="text-center mt-4">
                <button 
                  type="button" 
                  onClick={() => { setViewState('login'); clearMessages(); }}
                  className="text-sm text-gray-500 hover:text-gray-800"
                >
                  Cancelar e Voltar ao Login
                </button>
              </div>
            </form>
          )}

          {viewState === 'reset-password' && (
            <form onSubmit={handleResetSubmit} className="space-y-5">
              <p className="text-gray-600 text-sm">Crie uma nova senha de acesso.</p>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-500 mb-1 ml-1">Nova Senha</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); clearMessages(); }}
                  className={`w-full pr-4 pl-4 py-3 bg-[#f8f9fa] border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f21e8] transition-colors`}
                  placeholder="Nova senha (mín. 8 caracteres)"
                  disabled={loading}
                />
                {fieldErrors.newPassword && <p className="mt-1 text-sm text-red-600">{fieldErrors.newPassword}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-500 mb-1 ml-1">Confirme a Nova Senha</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); clearMessages(); }}
                  className={`w-full pr-4 pl-4 py-3 bg-[#f8f9fa] border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f21e8] transition-colors`}
                  placeholder="Repita a nova senha"
                  disabled={loading}
                />
                {fieldErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full bg-[#6f21e8] hover:bg-[#5b15cc] text-white py-6 mt-4 rounded-lg text-lg font-medium" disabled={loading}>
                {loading ? 'Redefinindo...' : 'Redefinir Senha'}
              </Button>
              
              <div className="text-center mt-4">
                <button 
                  type="button" 
                  onClick={() => { setViewState('login'); clearMessages(); }}
                  className="text-sm text-gray-500 hover:text-gray-800"
                >
                  Cancelar e Voltar ao Login
                </button>
              </div>
            </form>
          )}

          {viewState === 'login' && (
            <>
              <div className="mt-8 flex items-center gap-4">
                <hr className="flex-1 border-gray-200" />
                <span className="text-xs text-gray-400 font-medium tracking-wider">OR</span>
                <hr className="flex-1 border-gray-200" />
              </div>

              <div className="mt-8">
                <a href="/register">
                  <Button variant="secondary" className="w-full border border-[#6f21e8] text-[#6f21e8] bg-white hover:bg-gray-50 py-6 rounded-lg text-lg font-medium">Cadastre-se</Button>
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="hidden md:flex flex-col items-center justify-center bg-[#EFEFEF] p-12">
        <div className="max-w-xl text-center px-4 flex flex-col items-center justify-center space-y-10">
          {!logoError ? (
            <img 
              src="/brasao_ufba.png" 
              alt="Brasão da Universidade Federal da Bahia" 
              className="w-80 h-auto object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-80 h-64 border-2 border-dashed border-[#6f21e8] rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-white/50 shadow-inner">
              <svg width="40" height="40" fill="none" stroke="#6f21e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p className="text-[#6f21e8] font-semibold mb-2">Brasão ausente</p>
              <p className="text-sm text-gray-600">
                Salve o ícone PNG que você anexou na pasta:<br/>
                <code className="bg-gray-200 px-2 py-1 rounded text-[#3b0764] font-bold mt-2 inline-block">frontend/public/brasao_ufba.png</code>
              </p>
            </div>
          )}
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-[#6f21e8]">Seja bem-vindo ao SIAOA</h2>
            <p className="text-xl md:text-2xl text-[#6f21e8] opacity-90">Sistema de Informação e Acompanhamento de Orientações Acadêmicas</p>
          </div>
        </div>
      </div>
    </div>
  );
};
