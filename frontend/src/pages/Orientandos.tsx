import React, { useState } from 'react';
import { UserPlus, Search, Eye, XCircle, CheckCircle, X, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';

import { orientandoService, Orientando } from '@/services/orientandoService';
import { taskService } from '@/services/taskService';

export const Orientandos: React.FC = () => {
  const { addToast } = useNotificationStore();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOrientando = user?.profile === 'ORIENTANDO';
  
  const [orientandos, setOrientandos] = useState<Orientando[]>([]);
  const [tarefasCount, setTarefasCount] = useState(0);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await orientandoService.listOrientandos();
      setOrientandos(data);
      
      const userTasks = await taskService.listUserTasks();
      // Assuming tasks have a status. In taskService/types, it's TaskStatus enum. We can just check length for now.
      setTarefasCount(userTasks.filter(t => t.status !== 'COMPLETED').length);
    } catch (error) {
      console.error('Failed to load data', error);
    }
  };

  const displayOrientandos = isOrientando 
    ? orientandos.filter(o => o.email?.toLowerCase().trim() === user?.email?.toLowerCase().trim())
    : orientandos;

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDesativados, setShowDesativados] = useState(false);
  
  // Estado para o modal de edição
  const [editingOrientando, setEditingOrientando] = useState<Orientando | null>(null);

  const filteredOrientandos = displayOrientandos.filter(o => {
    const matchesSearch = o.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.projeto.toLowerCase().includes(searchTerm.toLowerCase());
    const isAtivo = o.status !== 'DESATIVADO';
    
    if (showDesativados) {
      return matchesSearch;
    }
    return matchesSearch && isAtivo;
  });

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const emailInput = (form.elements.namedItem('email') as HTMLInputElement).value;
    const email = emailInput.trim().toLowerCase();
    const modalidade = (form.elements.namedItem('modalidade') as HTMLSelectElement).value;

    if (!email) return;

    if (user?.email && email.trim().toLowerCase() === user.email.toLowerCase()) {
      addToast({
        id: Date.now().toString(),
        title: 'Operação Inválida',
        message: 'Você não pode enviar um convite de orientação para si mesmo.',
        type: 'WARNING'
      });
      return;
    }

    try {
      await orientandoService.createOrientando({
        nome: 'Aguardando cadastro',
        email,
        projeto: 'Projeto a definir',
        categoria: 'A definir',
        tipoCurso: modalidade,
        avatarCor: 'bg-purple-100 text-purple-600'
      });

      addToast({
        id: Date.now().toString(),
        title: 'Convite Enviado',
        message: `Um convite foi enviado para ${email}.`,
        type: 'SUCCESS'
      });
      
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data || 'Erro ao enviar o convite. O aluno possui cadastro como Orientando?';
      addToast({
        id: Date.now().toString(),
        title: 'Falha no Convite',
        message: typeof errorMessage === 'string' ? errorMessage : 'Ocorreu um erro no servidor.',
        type: 'ERROR'
      });
    }
  };

  const handleDesativar = async (id: string, nome: string) => {
    try {
      await orientandoService.updateStatus(id, 'DESATIVADO');
      addToast({
        id: Date.now().toString(),
        title: 'Ação Realizada',
        message: `O orientando ${nome} foi desativado.`,
        type: 'INFO'
      });
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReativar = async (id: string, nome: string) => {
    try {
      await orientandoService.updateStatus(id, 'VINCULADO');
      addToast({
        id: Date.now().toString(),
        title: 'Ação Realizada',
        message: `O orientando ${nome} foi reativado com sucesso.`,
        type: 'SUCCESS'
      });
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelar = async (id: string, nome: string) => {
    try {
      await orientandoService.cancelOrientando(id);
      addToast({
        id: Date.now().toString(),
        title: 'Convite Cancelado',
        message: `O convite para ${nome} foi cancelado.`,
        type: 'INFO'
      });
      loadData();
    } catch (error) {
      console.error(error);
      addToast({
        id: Date.now().toString(),
        title: 'Erro',
        message: 'Não foi possível cancelar o convite.',
        type: 'ERROR'
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingOrientando) return;

    const form = e.currentTarget;
    const projeto = (form.elements.namedItem('projeto') as HTMLInputElement).value;
    const modalidade = (form.elements.namedItem('modalidade') as HTMLSelectElement).value;

    try {
      await orientandoService.updateOrientando(editingOrientando.id, {
        projeto,
        tipoCurso: modalidade,
        categoria: editingOrientando.categoria // Optionally this could be editable too
      });
      
      addToast({
        id: Date.now().toString(),
        title: 'Orientando Atualizado',
        message: 'As informações foram salvas com sucesso.',
        type: 'SUCCESS'
      });
      
      setEditingOrientando(null);
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto relative">
      <h1 className="text-2xl font-bold text-gray-700 mb-8">Gerenciador de Orientandos</h1>
      
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-gray-600 mb-2">Total de Orientandos</h2>
          <span className="text-6xl font-bold text-[#6f21e8]">{displayOrientandos.filter(o => o.status !== 'DESATIVADO').length}</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-gray-600 mb-2">Projetos</h2>
          <span className="text-6xl font-bold text-[#6f21e8]">
            {new Set(displayOrientandos.filter(o => o.status !== 'DESATIVADO').map(o => o.projeto).filter(p => p && p !== 'Projeto a definir')).size}
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-gray-600 mb-2">Tarefas em Andamento</h2>
          <span className="text-6xl font-bold text-[#6f21e8]">
            {tarefasCount}
          </span>
        </div>
      </div>

      {/* Ações e Busca */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#6f21e8] hover:bg-[#5b1bc0] text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
          >
            <UserPlus size={20} />
            Convidar Orientando
          </button>

          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
            <input 
              type="checkbox" 
              checked={showDesativados}
              onChange={(e) => setShowDesativados(e.target.checked)}
              className="w-4 h-4 text-[#6f21e8] bg-gray-100 border-gray-300 rounded focus:ring-[#6f21e8] focus:ring-2 cursor-pointer"
            />
            Mostrar desativados
          </label>
        </div>
        
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Buscar" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f21e8]/50 text-sm"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="bg-[#a855f7] text-white">
              <tr>
                <th className="py-3 px-4 font-medium">Foto</th>
                <th className="py-3 px-4 font-medium">Nome</th>
                <th className="py-3 px-4 font-medium">Projeto</th>
                <th className="py-3 px-4 font-medium">Categoria</th>
                <th className="py-3 px-4 font-medium">Tipo do Curso</th>
                <th className="py-3 px-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrientandos.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-[#faf5ff]' : 'bg-white'}`}
                >
                  <td className="py-3 px-4 flex justify-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${item.avatarCor}`}>
                      {item.nome.charAt(0)}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    <div className="flex items-center justify-center gap-2">
                      <span>{item.nome}</span>
                      {item.status === 'PENDENTE' && (
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">PENDENTE</span>
                      )}
                      {item.status === 'RECUSADO' && (
                        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">RECUSADO</span>
                      )}
                      {item.status === 'DESATIVADO' && (
                        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">DESATIVADO</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{item.projeto}</td>
                  <td className="py-3 px-4 text-gray-600">{item.categoria}</td>
                  <td className="py-3 px-4 text-gray-600">{item.tipoCurso}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setEditingOrientando(item)}
                        className="bg-amber-400 hover:bg-amber-500 text-white px-3 py-1 rounded-md flex items-center gap-1 text-xs font-medium transition-colors"
                      >
                        <Eye size={14} />
                        Visualizar
                      </button>

                      <button 
                        onClick={() => navigate(`/orientandos/${item.id}/tarefas`)}
                        disabled={item.status === 'PENDENTE' || item.status === 'RECUSADO'}
                        className={`${item.status === 'PENDENTE' || item.status === 'RECUSADO' ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#6f21e8] hover:bg-[#5b1bc0]'} text-white px-3 py-1 rounded-md flex items-center gap-1 text-xs font-medium transition-colors`}
                      >
                        <ClipboardList size={14} />
                        Tarefas
                      </button>

                      {item.status === 'PENDENTE' ? (
                        <button 
                          onClick={() => handleCancelar(item.id, item.nome)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md flex items-center gap-1 text-xs font-medium transition-colors"
                        >
                          <XCircle size={14} />
                          Cancelar
                        </button>
                      ) : item.status !== 'DESATIVADO' ? (
                        <button 
                          onClick={() => handleDesativar(item.id, item.nome)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md flex items-center gap-1 text-xs font-medium transition-colors"
                        >
                          <XCircle size={14} />
                          Desativar
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleReativar(item.id, item.nome)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-md flex items-center gap-1 text-xs font-medium transition-colors"
                        >
                          <CheckCircle size={14} />
                          Reativar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrientandos.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-gray-500 text-center">
                    Nenhum orientando encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Convite / Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white shadow-xl w-full max-w-2xl overflow-hidden flex flex-col relative rounded-md">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X size={20} />
            </button>
            
            <div className="p-8 pb-4">
              <h3 className="text-2xl font-bold text-gray-600 mb-2">Convidar Orientando</h3>
              <p className="text-sm text-gray-500 mb-8">
                O aluno já deve possuir uma conta na plataforma com o perfil de Orientando para receber o convite.
              </p>
              
              <form onSubmit={handleInvite} className="flex flex-col gap-6">
                


                {/* E-mail e Modalidade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="email" className="text-sm font-bold text-[#6f21e8]">E-mail</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full px-4 py-2 bg-[#f0f0f0] border-transparent rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6f21e8]/50"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label htmlFor="modalidade" className="text-sm font-bold text-[#6f21e8]">Modalidade da orientação</label>
                    <select
                      id="modalidade"
                      name="modalidade"
                      required
                      defaultValue=""
                      className="w-full px-4 py-2 bg-[#f0f0f0] border-transparent rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6f21e8]/50 appearance-none"
                    >
                      <option value="" disabled></option>
                      <option value="TCC">TCC</option>
                      <option value="Iniciação Científica">Iniciação Científica</option>
                      <option value="Mestrado">Mestrado</option>
                      <option value="Doutorado">Doutorado</option>
                    </select>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex justify-center gap-4 mt-8 mb-4">
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-[#8b3dff] hover:bg-[#7b2cff] text-white font-bold rounded-lg transition-colors shadow-sm min-w-[140px]"
                  >
                    Enviar Convite
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-2.5 bg-[#9ca3af] hover:bg-gray-500 text-white font-bold rounded-lg transition-colors shadow-sm min-w-[140px]"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualizar / Editar Orientando */}
      {editingOrientando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white shadow-xl w-full max-w-2xl overflow-hidden flex flex-col relative rounded-md">
            <button 
              onClick={() => setEditingOrientando(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X size={20} />
            </button>
            
            <div className="p-8 pb-4">
              <h3 className="text-2xl font-bold text-gray-600 mb-8">Editar Orientando</h3>
              
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-6">
                
                {/* Nome Completo */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit_nome" className="text-sm font-bold text-[#6f21e8]">Nome Completo</label>
                  <input
                    id="edit_nome"
                    name="nome"
                    type="text"
                    required
                    defaultValue={editingOrientando.nome}
                    className="w-full px-4 py-2 bg-[#f0f0f0] border-transparent rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6f21e8]/50"
                  />
                </div>

                {/* E-mail e Modalidade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="edit_email" className="text-sm font-bold text-[#6f21e8]">E-mail</label>
                    <input
                      id="edit_email"
                      name="email"
                      type="email"
                      defaultValue={editingOrientando.email}
                      className="w-full px-4 py-2 bg-[#f0f0f0] border-transparent rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6f21e8]/50"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label htmlFor="edit_modalidade" className="text-sm font-bold text-[#6f21e8]">Modalidade da orientação</label>
                    <select
                      id="edit_modalidade"
                      name="modalidade"
                      required
                      defaultValue={editingOrientando.tipoCurso}
                      className="w-full px-4 py-2 bg-[#f0f0f0] border-transparent rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6f21e8]/50 appearance-none"
                    >
                      <option value="TCC">TCC</option>
                      <option value="Iniciação Científica">Iniciação Científica</option>
                      <option value="Mestrado">Mestrado</option>
                      <option value="Doutorado">Doutorado</option>
                      <option value="Graduação">Graduação</option>
                    </select>
                  </div>
                </div>

                {/* Projeto */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit_projeto" className="text-sm font-bold text-[#6f21e8]">Projeto Vinculado</label>
                  <input
                    id="edit_projeto"
                    name="projeto"
                    type="text"
                    defaultValue={editingOrientando.projeto}
                    className="w-full px-4 py-2 bg-[#f0f0f0] border-transparent rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6f21e8]/50"
                  />
                </div>

                {/* Botões */}
                <div className="flex justify-center gap-4 mt-8 mb-4">
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-[#8b3dff] hover:bg-[#7b2cff] text-white font-bold rounded-lg transition-colors shadow-sm min-w-[140px]"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingOrientando(null)}
                    className="px-8 py-2.5 bg-[#9ca3af] hover:bg-gray-500 text-white font-bold rounded-lg transition-colors shadow-sm min-w-[140px]"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
