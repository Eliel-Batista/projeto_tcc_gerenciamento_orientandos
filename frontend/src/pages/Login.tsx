import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { User, Lock, Eye, EyeOff, UserPlus, HelpCircle, ExternalLink } from 'lucide-react';

type ViewState = 'login' | 'forgot-password' | 'verify-code' | 'reset-password';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading, error, clearError, isAuthenticated } = useAuthStore();

  const [viewState, setViewState] = useState<ViewState>('login');
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [email, setEmail] = useState(''); // Representa o "Usuário"
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; code?: string; newPassword?: string; confirmPassword?: string }>({});
  const [touched, setTouched] = useState({ email: false, password: false, code: false, newPassword: false, confirmPassword: false });
  const [showPassword, setShowPassword] = useState(false);

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
    if (!email) newErrors.email = 'Usuário é obrigatório';
    if (!password) newErrors.password = 'Senha é obrigatória';
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: 'email' | 'password' | 'code' | 'newPassword' | 'confirmPassword') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!validateLoginForm()) return;
    try {
      // Aqui usamos o email como "usuário"
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch {
      // error is already in store
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!email) {
      setFieldErrors({ email: 'Usuário/Email é obrigatório' });
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
    <div className="min-h-screen flex font-sans">
      
      {/* Painel Esquerdo (Informativo / Decorativo) */}
      <div 
        className="hidden lg:flex flex-col justify-between w-[65%] p-12 text-white bg-[#2E0B5B] bg-cover bg-bottom relative"
        style={{ backgroundImage: 'url(/tela_login.png)' }}
      >
        <div className="flex items-center gap-4 mt-8 z-10">
          <img src="/brasao_ufba.png" alt="Brasão UFBA" className="w-16 h-auto drop-shadow-md" />
          <div className="border-l border-white/30 pl-4">
            <h2 className="text-3xl font-serif font-bold tracking-wider">UFBA</h2>
            <p className="text-sm text-gray-200 mt-1">Universidade Federal<br/>da Bahia</p>
          </div>
        </div>

        <div className="mb-[50vh] max-w-md z-10">
          <h1 className="text-7xl font-serif font-bold mb-2 text-[#C084FC]">SAOA</h1>
          <h3 className="text-xl font-medium mb-8 text-white">Sistema de Apoio e Organização Acadêmica</h3>
          
          <div className="w-12 h-0.5 bg-[#C084FC] mb-6"></div>
          
          <p className="text-sm leading-relaxed text-gray-200">
            Uma plataforma integrada para apoiar a gestão acadêmica, 
            promover a organização e fortalecer a comunidade universitária.
          </p>
        </div>
      </div>

      {/* Painel Direito (Formulário) */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F4F2F7] p-4 relative overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            
            <div className="flex flex-col items-center mb-8">
              <img src="/icone_saoa.png" alt="SAOA Logo" className="w-24 h-24 mb-2 object-contain" />
              <h2 className="text-4xl font-serif font-bold text-[#4B0082] tracking-wide mb-1">SAOA</h2>
              <p className="text-xs text-gray-500 font-medium">Sistema de Apoio e Organização Acadêmica</p>
            </div>

            {displayError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-2">
                <span>{displayError}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-3 bg-green-50 border border-green-100 rounded-xl text-green-600 text-sm flex items-start gap-2">
                <span>{successMessage}</span>
              </div>
            )}

            {viewState === 'login' && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <hr className="flex-1 border-gray-200" />
                  <span className="text-sm font-bold text-[#4B0082]">Acesse sua conta</span>
                  <hr className="flex-1 border-gray-200" />
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-[#4B0082] mb-1.5 ml-1">Usuário</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <User size={18} />
                      </div>
                      <input
                        id="email"
                        type="text"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                        onBlur={() => handleBlur('email')}
                        className={`w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B0082]/20 focus:border-[#4B0082] transition-all text-sm ${
                          touched.email && fieldErrors.email ? 'border-red-400' : ''
                        }`}
                        placeholder="Digite seu usuário"
                        disabled={loading}
                      />
                    </div>
                    {fieldErrors.email && <p className="mt-1 ml-1 text-xs text-red-500">{fieldErrors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-xs font-bold text-[#4B0082] mb-1.5 ml-1">Senha</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock size={18} />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
                        onBlur={() => handleBlur('password')}
                        className={`w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B0082]/20 focus:border-[#4B0082] transition-all text-sm ${
                          touched.password && fieldErrors.password ? 'border-red-400' : ''
                        }`}
                        placeholder="Digite sua senha"
                        disabled={loading}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {fieldErrors.password && <p className="mt-1 ml-1 text-xs text-red-500">{fieldErrors.password}</p>}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button 
                      type="button" 
                      onClick={() => { setViewState('forgot-password'); clearMessages(); }}
                      className="text-xs text-[#4B0082] font-semibold hover:underline"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>

                  <Button type="submit" className="w-full bg-[#7852EA] hover:bg-[#643fdc] text-white py-6 rounded-xl font-medium shadow-md shadow-purple-900/10 transition-all mt-2" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>

                <div className="flex items-center gap-4 my-6">
                  <hr className="flex-1 border-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">ou</span>
                  <hr className="flex-1 border-gray-200" />
                </div>

                <Link to="/register" className="block">
                  <Button variant="secondary" className="w-full border-2 border-[#7852EA] text-[#7852EA] hover:bg-[#7852EA]/5 py-6 rounded-xl font-semibold flex items-center justify-center gap-2">
                    <UserPlus size={18} />
                    Cadastre-se
                  </Button>
                </Link>
              </>
            )}

            {/* Telas de Recuperação (mesmo layout visual) */}
            {viewState === 'forgot-password' && (
              <form onSubmit={handleForgotSubmit} className="space-y-5">
                <div className="flex items-center gap-4 mb-6">
                  <hr className="flex-1 border-gray-200" />
                  <span className="text-sm font-bold text-[#4B0082]">Recuperar senha</span>
                  <hr className="flex-1 border-gray-200" />
                </div>
                <p className="text-gray-500 text-xs text-center mb-6">Digite seu usuário/e-mail para receber um código de recuperação.</p>
                <div>
                  <label htmlFor="reset-email" className="block text-xs font-bold text-[#4B0082] mb-1.5 ml-1">Usuário / E-Mail</label>
                  <div className="relative">
                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <User size={18} />
                      </div>
                    <input
                      id="reset-email"
                      type="text"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B0082]/20 focus:border-[#4B0082] transition-all text-sm"
                      placeholder="Digite seu usuário ou e-mail"
                      disabled={loading}
                    />
                  </div>
                  {fieldErrors.email && <p className="mt-1 ml-1 text-xs text-red-500">{fieldErrors.email}</p>}
                </div>

                <Button type="submit" className="w-full bg-[#7852EA] hover:bg-[#643fdc] text-white py-6 rounded-xl font-medium shadow-md shadow-purple-900/10 transition-all mt-4" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar Código'}
                </Button>

                <div className="text-center mt-6">
                  <button type="button" onClick={() => { setViewState('login'); clearMessages(); }} className="text-xs text-gray-500 hover:text-[#4B0082] font-semibold underline underline-offset-2">
                    Voltar para o Login
                  </button>
                </div>
              </form>
            )}

            {viewState === 'verify-code' && (
              <form onSubmit={handleVerifySubmit} className="space-y-5">
                <div className="flex items-center gap-4 mb-6">
                  <hr className="flex-1 border-gray-200" />
                  <span className="text-sm font-bold text-[#4B0082]">Verificar Código</span>
                  <hr className="flex-1 border-gray-200" />
                </div>
                <p className="text-gray-500 text-xs text-center mb-6">Um código de 6 dígitos foi enviado para <span className="font-bold">{email}</span>.</p>
                
                <div>
                  <label htmlFor="code" className="block text-xs font-bold text-[#4B0082] mb-1.5 ml-1">Código de Recuperação</label>
                  <input
                    id="code"
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => { setCode(e.target.value); clearMessages(); }}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B0082]/20 focus:border-[#4B0082] transition-all text-center tracking-[0.5em] text-lg font-mono"
                    placeholder="000000"
                    disabled={loading}
                  />
                  {fieldErrors.code && <p className="mt-1 ml-1 text-xs text-red-500">{fieldErrors.code}</p>}
                </div>

                <Button type="submit" className="w-full bg-[#7852EA] hover:bg-[#643fdc] text-white py-6 rounded-xl font-medium shadow-md shadow-purple-900/10 transition-all mt-4" disabled={loading}>
                  {loading ? 'Verificando...' : 'Verificar Código'}
                </Button>
                
                <div className="text-center mt-6">
                  <button type="button" onClick={() => { setViewState('login'); clearMessages(); }} className="text-xs text-gray-500 hover:text-[#4B0082] font-semibold underline underline-offset-2">
                    Cancelar e Voltar ao Login
                  </button>
                </div>
              </form>
            )}

            {viewState === 'reset-password' && (
              <form onSubmit={handleResetSubmit} className="space-y-5">
                <div className="flex items-center gap-4 mb-6">
                  <hr className="flex-1 border-gray-200" />
                  <span className="text-sm font-bold text-[#4B0082]">Nova Senha</span>
                  <hr className="flex-1 border-gray-200" />
                </div>
                <p className="text-gray-500 text-xs text-center mb-6">Crie uma nova senha de acesso.</p>

                <div>
                  <label htmlFor="newPassword" className="block text-xs font-bold text-[#4B0082] mb-1.5 ml-1">Nova Senha</label>
                  <div className="relative">
                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock size={18} />
                      </div>
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); clearMessages(); }}
                      className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B0082]/20 focus:border-[#4B0082] transition-all text-sm"
                      placeholder="Nova senha (mín. 8 caracteres)"
                      disabled={loading}
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                  </div>
                  {fieldErrors.newPassword && <p className="mt-1 ml-1 text-xs text-red-500">{fieldErrors.newPassword}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-bold text-[#4B0082] mb-1.5 ml-1">Confirme a Nova Senha</label>
                  <div className="relative">
                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock size={18} />
                      </div>
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); clearMessages(); }}
                      className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B0082]/20 focus:border-[#4B0082] transition-all text-sm"
                      placeholder="Repita a nova senha"
                      disabled={loading}
                    />
                  </div>
                  {fieldErrors.confirmPassword && <p className="mt-1 ml-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>}
                </div>

                <Button type="submit" className="w-full bg-[#7852EA] hover:bg-[#643fdc] text-white py-6 rounded-xl font-medium shadow-md shadow-purple-900/10 transition-all mt-4" disabled={loading}>
                  {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                </Button>
                
                <div className="text-center mt-6">
                  <button type="button" onClick={() => { setViewState('login'); clearMessages(); }} className="text-xs text-gray-500 hover:text-[#4B0082] font-semibold underline underline-offset-2">
                    Cancelar e Voltar ao Login
                  </button>
                </div>
              </form>
            )}

          </div>

          <div className="mt-8 flex justify-center items-center gap-2 text-xs text-[#4B0082] font-medium opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
            <HelpCircle size={16} />
            <span>Precisa de ajuda?</span>
            <span className="underline ml-1">Acesse o suporte</span>
            <ExternalLink size={14} className="ml-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
