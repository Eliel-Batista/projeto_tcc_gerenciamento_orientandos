import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { RegisterRequest } from '@/types/index';

interface FormErrors {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  fullName?: string;
  profile?: string;
  submit?: string;
}

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError, isAuthenticated } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    fullName: '',
    profile: 'ORIENTANDO' as const,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    passwordConfirm: false,
    fullName: false,
    profile: false,
  });
  const [logoError, setLogoError] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear submit error when user starts typing
  useEffect(() => {
    if (error && errors.submit) {
      clearError();
      setErrors((prev) => ({ ...prev, submit: undefined }));
    }
  }, [formData, error, errors.submit, clearError]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.fullName) {
      newErrors.fullName = 'Nome completo é obrigatório';
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Senha deve conter pelo menos uma letra maiúscula';
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = 'Senha deve conter pelo menos um número';
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Senhas não coincidem';
    }

    if (!formData.profile) {
      newErrors.profile = 'Tipo de usuário é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    const newErrors: FormErrors = { ...errors };
    
    if (field === 'email') {
      if (!formData.email) {
        newErrors.email = 'Email é obrigatório';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      } else {
        delete newErrors.email;
      }
    } else if (field === 'fullName') {
      if (!formData.fullName) {
        newErrors.fullName = 'Nome completo é obrigatório';
      } else if (formData.fullName.length < 3) {
        newErrors.fullName = 'Nome deve ter pelo menos 3 caracteres';
      } else {
        delete newErrors.fullName;
      }
    } else if (field === 'password') {
      if (!formData.password) {
        newErrors.password = 'Senha é obrigatória';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
      } else if (!/(?=.*[A-Z])/.test(formData.password)) {
        newErrors.password = 'Senha deve conter pelo menos uma letra maiúscula';
      } else if (!/(?=.*[0-9])/.test(formData.password)) {
        newErrors.password = 'Senha deve conter pelo menos um número';
      } else {
        delete newErrors.password;
      }
    } else if (field === 'passwordConfirm') {
      if (!formData.passwordConfirm) {
        newErrors.passwordConfirm = 'Confirmação de senha é obrigatória';
      } else if (formData.password !== formData.passwordConfirm) {
        newErrors.passwordConfirm = 'Senhas não coincidem';
      } else {
        delete newErrors.passwordConfirm;
      }
    } else if (field === 'profile') {
      if (!formData.profile) {
        newErrors.profile = 'Tipo de usuário é obrigatório';
      } else {
        delete newErrors.profile;
      }
    }
    
    setErrors(newErrors);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const registerData: RegisterRequest = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        profile: formData.profile,
      };
      
      await register(registerData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: error || 'Erro ao fazer registro' }));
    }
  };

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

          <h2 className="text-3xl font-bold text-[#8B5CF6] mb-8">Crie sua conta</h2>

          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-[#8B5CF6] mb-1 ml-1">Nome Completo</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={() => handleBlur('fullName')}
                className={`w-full px-4 py-3 bg-[#f3f4f6] border-none rounded-md focus:outline-none focus:ring-2 transition-colors ${
                  touched.fullName && errors.fullName ? 'ring-2 ring-red-500' : 'focus:ring-[#6f21e8]'
                }`}
                disabled={loading}
              />
              {touched.fullName && errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="profile" className="block text-xs font-semibold text-[#8B5CF6] mb-1 ml-1">Perfil Institucional</label>
              <select
                id="profile"
                name="profile"
                value={formData.profile}
                onChange={handleChange}
                onBlur={() => handleBlur('profile')}
                className={`w-full px-4 py-3 bg-[#f3f4f6] border-none rounded-md focus:outline-none focus:ring-2 transition-colors ${
                  touched.profile && errors.profile ? 'ring-2 ring-red-500' : 'focus:ring-[#6f21e8]'
                }`}
                disabled={loading}
              >
                <option value="ORIENTANDO">Orientando</option>
                <option value="ORIENTADOR">Orientador</option>
              </select>
              {touched.profile && errors.profile && <p className="mt-1 text-xs text-red-600">{errors.profile}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[#8B5CF6] mb-1 ml-1">E-mail Institucional</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                className={`w-full px-4 py-3 bg-[#f3f4f6] border-none rounded-md focus:outline-none focus:ring-2 transition-colors ${
                  touched.email && errors.email ? 'ring-2 ring-red-500' : 'focus:ring-[#6f21e8]'
                }`}
                disabled={loading}
              />
              {touched.email && errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-[#8B5CF6] mb-1 ml-1">Senha de acesso</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                className={`w-full px-4 py-3 bg-[#f3f4f6] border-none rounded-md focus:outline-none focus:ring-2 transition-colors ${
                  touched.password && errors.password ? 'ring-2 ring-red-500' : 'focus:ring-[#6f21e8]'
                }`}
                disabled={loading}
              />
              {touched.password && errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="block text-xs font-semibold text-[#8B5CF6] mb-1 ml-1">Confirmar senha</label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                value={formData.passwordConfirm}
                onChange={handleChange}
                onBlur={() => handleBlur('passwordConfirm')}
                className={`w-full px-4 py-3 bg-[#f3f4f6] border-none rounded-md focus:outline-none focus:ring-2 transition-colors ${
                  touched.passwordConfirm && errors.passwordConfirm ? 'ring-2 ring-red-500' : 'focus:ring-[#6f21e8]'
                }`}
                disabled={loading}
              />
              {touched.passwordConfirm && errors.passwordConfirm && <p className="mt-1 text-xs text-red-600">{errors.passwordConfirm}</p>}
            </div>

            <Button type="submit" className="w-full bg-[#4c0587] hover:bg-[#380266] text-white py-6 mt-4 rounded-md text-sm font-semibold" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
            </Button>
          </form>
        </div>
      </div>

      <div className="hidden md:flex flex-col relative bg-[#EFEFEF]">
        <div className="absolute top-8 right-8 flex gap-3">
          <a href="/login" className="flex-1">
            <Button className="w-32 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white py-2 rounded-sm text-sm">Login</Button>
          </a>
          <Button variant="secondary" className="w-32 border border-[#8B5CF6] text-[#8B5CF6] bg-[#e5e5e5] hover:bg-[#e5e5e5] py-2 rounded-sm text-sm opacity-80 cursor-default">Cadastre-se</Button>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-12">
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
                Salve o ícone PNG na pasta:<br/>
                <code className="bg-gray-200 px-2 py-1 rounded text-[#3b0764] font-bold mt-2 inline-block">public/brasao_ufba.png</code>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

