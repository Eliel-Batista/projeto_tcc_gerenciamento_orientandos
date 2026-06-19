import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, PlusSquare, Clock, X, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useNotificationStore } from '@/stores/notificationStore';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { taskService } from '@/services/taskService';
import { orientandoService, Orientando } from '@/services/orientandoService';
import { projectService } from '@/services/projectService';
import { Task, Project } from '@/types';

export const OrientandoTarefas: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotificationStore();
  const { user } = useAuthStore();

  const [tarefas, setTarefas] = useState<Task[]>([]);
  const [orientandos, setOrientandos] = useState<Orientando[]>([]);
  const [projetos, setProjetos] = useState<Project[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showConcluidas, setShowConcluidas] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarefaId, setEditingTarefaId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    dataLimite: '',
    descricao: '',
    atividades: [] as { descricao: string; completed: boolean }[],
    comentarios: [] as any[]
  });
  
  const [novaAtividade, setNovaAtividade] = useState('');
  const [novoComentario, setNovoComentario] = useState('');
  
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [errors, setErrors] = useState({
    titulo: false,
    dataLimite: false
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const oris = await orientandoService.listOrientandos();
      setOrientandos(oris);

      const projs = await projectService.listProjects();
      setProjetos(projs);

      // In a real scenario, we would filter tasks by project or user
      let tks: Task[] = [];
      if (user?.profile === 'ORIENTADOR' && id) {
        const targetOrientando = oris.find(o => o.id === id);
        const targetUserId = targetOrientando?.userId || id;
        tks = await taskService.listTasksByUser(targetUserId);
      } else {
        tks = await taskService.listUserTasks();
      }
      setTarefas(tks);
    } catch (error) {
      console.error(error);
    }
  };

  let headerInfo: any = null;

  if (user?.profile === 'ORIENTADOR') {
    const targetOrientando = orientandos.find(o => o.id === id);
    if (targetOrientando) {
      headerInfo = {
        nome: targetOrientando.nome,
        nivel: targetOrientando.tipoCurso || 'Orientando',
        avatarCor: targetOrientando.avatarCor || 'bg-blue-100 text-blue-600',
        isOrientando: true
      };
    }
  } else {
    // É Orientando
    const linkedOrientando = orientandos.find(
      (o) => o.email?.toLowerCase().trim() === user?.email?.toLowerCase().trim() && o.status === 'VINCULADO'
    );
    if (linkedOrientando) {
      headerInfo = {
        nome: 'Prof. Orientador', 
        nivel: linkedOrientando.tipoCurso,
        avatarCor: 'bg-[#6f21e8] text-white',
        isOrientando: false
      };
    }
  }

  const getDueDateInfo = (dataLimiteStr?: string, status?: string) => {
    if (!dataLimiteStr || status === 'COMPLETED') {
      return { colorClass: 'text-gray-400', isLate: false, isToday: false };
    }
    const targetDatePart = dataLimiteStr.split('T')[0];
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const localTodayStr = `${yyyy}-${mm}-${dd}`;

    if (targetDatePart === localTodayStr) {
      return { colorClass: 'text-yellow-500', isLate: false, isToday: true };
    } else if (targetDatePart < localTodayStr) {
      return { colorClass: 'text-red-500', isLate: true, isToday: false };
    } else {
      return { colorClass: 'text-gray-400', isLate: false, isToday: false };
    }
  };

  const handleOpenModal = (tarefa?: Task) => {
    if (tarefa) {
      setEditingTarefaId(tarefa.id);
      setIsReadOnly(false);
      setFormData({
        titulo: tarefa.title,
        dataLimite: tarefa.dueDate ? tarefa.dueDate.split('T')[0] : '',
        descricao: tarefa.description || '',
        atividades: tarefa.activities ? tarefa.activities.map(a => ({ descricao: a.description, completed: a.completed })) : [],
        comentarios: tarefa.comments || []
      });
    } else {
      setEditingTarefaId(null);
      setIsReadOnly(false);
      setFormData({ titulo: '', dataLimite: '', descricao: '', atividades: [], comentarios: [] });
      setNovaAtividade('');
      setNovoComentario('');
    }
    setErrors({ titulo: false, dataLimite: false });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      titulo: !formData.titulo.trim(),
      dataLimite: !formData.dataLimite
    };

    setErrors(newErrors);

    if (newErrors.titulo || newErrors.dataLimite) {
      return;
    }

    try {
      const dateFormatted = formData.dataLimite;
      if (editingTarefaId) {
        await taskService.updateTask(editingTarefaId, {
          title: formData.titulo,
          description: formData.descricao,
          dueDate: dateFormatted,
          activities: formData.atividades.map(a => ({
            description: a.descricao,
            completed: a.completed
          })),
          comments: formData.comentarios
        });
        addToast({ id: Date.now().toString(), title: 'Tarefa Atualizada', message: 'A tarefa foi salva com sucesso.', type: 'SUCCESS' });
      } else {
        let projectId = '';
        if (projetos.length > 0) {
          projectId = projetos[0].id;
        } else {
          // Create a default project transparently since the UI doesn't have a project creation flow yet
          const newProject = await projectService.createProject({
            title: 'Projeto Padrão',
            description: 'Projeto base criado automaticamente',
            projectType: 'TCC',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
          });
          projectId = newProject.id;
          
          // Add to local state so subsequent tasks use the same project
          setProjetos([newProject]);
        }
        
        await taskService.createTask(projectId, {
          title: formData.titulo,
          description: formData.descricao,
          taskType: 'OUTRA',
          priority: 'MEDIUM',
          dueDate: dateFormatted,
          status: 'PENDING',
          assignedToId: user?.profile === 'ORIENTADOR' && id ? (orientandos.find(o => o.id === id)?.userId || id) : user?.id,
          activities: formData.atividades.map(a => a.descricao)
        });
        addToast({ id: Date.now().toString(), title: 'Tarefa Criada', message: 'A nova tarefa foi criada.', type: 'SUCCESS' });
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      addToast({ id: Date.now().toString(), title: 'Erro', message: 'Falha ao salvar a tarefa.', type: 'ERROR' });
    }
  };

  const handleAddActivity = async () => {
    if (!novaAtividade.trim()) return;

    const newAtiv = { descricao: novaAtividade.trim(), completed: false };
    const newAtivs = [...formData.atividades, newAtiv];

    setFormData({
      ...formData,
      atividades: newAtivs
    });
    setNovaAtividade('');

    if (editingTarefaId) {
      try {
        await taskService.updateTask(editingTarefaId, {
          activities: newAtivs.map(a => ({
            description: a.descricao,
            completed: a.completed
          }))
        });
        loadData();
      } catch (error) {
        console.error('Erro ao adicionar atividade:', error);
        addToast({ id: Date.now().toString(), title: 'Erro', message: 'Falha ao salvar a nova atividade.', type: 'ERROR' });
      }
    }
  };

  const handleToggleActivity = async (idx: number, completed: boolean) => {
    const newAtivs = [...formData.atividades];
    newAtivs[idx].completed = completed;
    
    setFormData({
      ...formData,
      atividades: newAtivs
    });

    if (editingTarefaId) {
      try {
        await taskService.updateTask(editingTarefaId, {
          activities: newAtivs.map(a => ({
            description: a.descricao,
            completed: a.completed
          }))
        });
        loadData();
      } catch (error) {
        console.error('Erro ao atualizar atividade:', error);
        addToast({ id: Date.now().toString(), title: 'Erro', message: 'Falha ao salvar a atividade.', type: 'ERROR' });
      }
    }
  };

  const handleAddComment = async () => {
    if (!novoComentario.trim()) return;

    const newComment = { content: novoComentario.trim() };
    const newComments = [...formData.comentarios, newComment];

    setFormData({
      ...formData,
      comentarios: newComments
    });
    setNovoComentario('');

    if (editingTarefaId) {
      try {
        const updatedTask = await taskService.updateTask(editingTarefaId, {
          comments: newComments
        });
        if (updatedTask && updatedTask.comments) {
          setFormData(prev => ({
            ...prev,
            comentarios: updatedTask.comments || []
          }));
        }
        loadData();
      } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        addToast({ id: Date.now().toString(), title: 'Erro', message: 'Falha ao enviar o comentário.', type: 'ERROR' });
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      addToast({ id: Date.now().toString(), title: 'Tarefa Excluída', message: 'A tarefa foi removida.', type: 'INFO' });
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleConcluida = async (task: Task) => {
    try {
      const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await taskService.updateTask(task.id, { status: newStatus });
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredTarefas = tarefas.filter(t => {
    const matchBusca = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchConcluida = showConcluidas ? t.status === 'COMPLETED' : t.status !== 'COMPLETED';
    return matchBusca && matchConcluida;
  });

  return (
    <div className="max-w-[1600px] mx-auto relative flex flex-col h-full">
      {/* Header com Orientador e Botões */}
      <div className="flex flex-wrap items-center gap-6 mb-8 mt-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex flex-col items-center justify-center min-w-[180px]">
          {headerInfo ? (
            <>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl mb-2 ${headerInfo.avatarCor}`}>
                {headerInfo.isOrientando ? headerInfo.nome.charAt(0).toUpperCase() : (
                  <svg className="w-8 h-8 text-current" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
              <span className="font-bold text-[#6f21e8] text-sm text-center">{headerInfo.nome}</span>
              <span className="text-gray-400 text-xs text-center">{headerInfo.nivel}</span>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl mb-2 bg-gray-100 text-gray-400">
                <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <span className="font-bold text-gray-400 text-sm text-center">
                {user?.profile === 'ORIENTADOR' ? 'Orientando não encontrado' : 'Sem orientador'}
              </span>
              <span className="text-gray-400 text-xs text-center">
                {user?.profile === 'ORIENTADOR' ? 'Verifique a lista' : 'Não vinculado'}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col gap-4 flex-1">
          <h1 className="text-3xl font-bold text-gray-500">Tarefas Atribuídas</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => handleOpenModal()}
              className="bg-[#6f21e8] hover:bg-[#5b1bc0] text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-sm"
            >
              <PlusSquare size={18} /> Adicionar Tarefa
            </button>
            {user?.profile === 'ORIENTANDO' ? (
              <button 
                onClick={() => navigate('/links')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Visualizar recomendações
              </button>
            ) : (
              <button 
                onClick={() => addToast({ id: Date.now().toString(), title: 'Em breve', message: 'Recurso de recomendar leitura', type: 'INFO' })}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Recomendar Leitura
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Busca e Filtro */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-2xl bg-white rounded-lg shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Buscar" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f21e8]/50 text-sm"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 font-medium">
            <input 
              type="checkbox" 
              checked={showConcluidas}
              onChange={(e) => setShowConcluidas(e.target.checked)}
              className="rounded text-[#6f21e8] focus:ring-[#6f21e8] w-4 h-4 cursor-pointer"
            />
            Concluídas
          </label>
          <button className="flex flex-col items-center text-gray-400 hover:text-gray-600 px-4">
            <span className="text-xs mb-1">Filtrar:</span>
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Grid de Tarefas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
        {filteredTarefas.map(tarefa => {
          const concluida = tarefa.status === 'COMPLETED';
          const isCreator = tarefa.createdBy?.id === user?.id || tarefa.createdById === user?.id;
          const dueDateInfo = getDueDateInfo(tarefa.dueDate, tarefa.status);

          return (
            <div key={tarefa.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#6f21e8] mb-2 truncate">{tarefa.title}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{tarefa.description}</p>
              </div>
              
              <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-gray-400">Data inicio: {tarefa.createdAt ? format(parseISO(tarefa.createdAt), 'dd/MM/yyyy') : '--'}</span>
                  <span className={`flex items-center gap-1 font-semibold ${dueDateInfo.colorClass}`}>
                    {(dueDateInfo.isLate || dueDateInfo.isToday) && <Clock size={14} />} Data limite: {tarefa.dueDate ? format(parseISO(tarefa.dueDate), 'dd/MM/yyyy') : '--'}
                  </span>
                </div>
                
                <div className="flex items-end gap-2">
                  {user?.profile === 'ORIENTANDO' ? (
                    isCreator ? (
                      // Tarefas criadas pelo próprio orientando: Excluir, Editar e Concluir
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleDelete(tarefa.id)}
                          className="bg-[#dc2626] hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
                        >
                          Excluir
                        </button>
                        <button 
                          onClick={() => handleOpenModal(tarefa)}
                          className="bg-[#eab308] hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => toggleConcluida(tarefa)}
                          className={`font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2 ${concluida ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                        >
                          <CheckCircle size={16} />
                          {concluida ? 'Reabrir' : 'Concluir'}
                        </button>
                      </div>
                    ) : (
                      // Tarefas atribuídas pelo orientador: Visualizar e Concluir
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-gray-400 font-medium">
                          Atribuído por: {tarefa.createdBy?.fullName || 'Prof. Orientador'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => toggleConcluida(tarefa)}
                            className={`font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2 ${concluida ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                          >
                            <CheckCircle size={16} />
                            {concluida ? 'Reabrir' : 'Concluir'}
                          </button>
                          <button 
                            onClick={() => handleOpenModal(tarefa)}
                            className="bg-[#eab308] hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors shadow-sm"
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    )
                  ) : (
                    // Para o orientador: Editar e Excluir
                    <>
                      <button 
                        onClick={() => handleOpenModal(tarefa)}
                        className="bg-[#eab308] hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors shadow-sm"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(tarefa.id)}
                        className="bg-[#dc2626] hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors shadow-sm"
                      >
                        Excluir
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Adicionar / Editar Tarefa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col relative rounded-xl">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X size={20} />
            </button>
            
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-600 mb-6">
                {isReadOnly ? 'Visualizar Tarefa' : editingTarefaId ? 'Editar Tarefa' : 'Adicionar Tarefa'}
              </h3>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                
                {/* Linha 1: Título e Data Limite */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="titulo" className="text-sm font-bold text-[#6f21e8]">Título</label>
                    <input
                      id="titulo"
                      type="text"
                      value={formData.titulo}
                      onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                      disabled={isReadOnly}
                      className={`w-full px-4 py-2 bg-[#f0f0f0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b3dff]/50 border ${errors.titulo ? 'border-red-500' : 'border-transparent'} ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                    {errors.titulo && <span className="text-red-500 text-xs font-semibold">*Campo obrigatório</span>}
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label htmlFor="dataLimite" className="text-sm font-bold text-[#6f21e8]">Data Limite</label>
                    <input
                      id="dataLimite"
                      type="date"
                      value={formData.dataLimite}
                      onChange={(e) => setFormData({...formData, dataLimite: e.target.value})}
                      disabled={isReadOnly}
                      className={`w-full px-4 py-2 bg-[#f0f0f0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b3dff]/50 border ${errors.dataLimite ? 'border-red-500' : 'border-transparent'} ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                    {errors.dataLimite && <span className="text-red-500 text-xs font-semibold">*Campo obrigatório</span>}
                  </div>
                </div>

                {/* Linha 2: Descrição */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="descricao" className="text-sm font-bold text-[#6f21e8]">Descrição</label>
                  <textarea
                    id="descricao"
                    rows={4}
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    disabled={isReadOnly}
                    className={`w-full px-4 py-2 bg-[#f0f0f0] border-transparent rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b3dff]/50 resize-none ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                  ></textarea>
                </div>

                {/* Linha 3: Atividades e Comentários */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Coluna Esquerda: Atividades */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-600">Atividades</label>
                    <div className="flex items-center gap-2 mb-2">
                      <button 
                        type="button" 
                        onClick={handleAddActivity}
                        disabled={isReadOnly}
                        className={`text-xs px-3 py-1.5 border border-gray-300 rounded font-medium flex items-center gap-1 ${!isReadOnly ? 'hover:bg-gray-50' : 'opacity-70'}`}
                      >
                        <PlusSquare size={12} /> Adicionar Atividade
                      </button>
                      <input 
                        type="text" 
                        value={novaAtividade}
                        onChange={(e) => setNovaAtividade(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddActivity();
                          }
                        }}
                        placeholder="Nova atividade..."
                        disabled={isReadOnly}
                        className="flex-1 text-xs px-2 py-1.5 bg-[#f0f0f0] rounded focus:bg-white border border-transparent focus:border-[#8b3dff] focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto">
                      {formData.atividades.map((ativ, idx) => (
                        <label key={idx} className="flex items-center gap-2 text-xs text-gray-600 bg-white border border-gray-200 p-2 rounded cursor-pointer hover:bg-gray-50 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={ativ.completed}
                            onChange={(e) => handleToggleActivity(idx, e.target.checked)}
                            className="rounded text-[#6f21e8] focus:ring-[#6f21e8] w-3 h-3 cursor-pointer"
                          />
                          <span className={ativ.completed ? 'line-through opacity-70' : ''}>{ativ.descricao}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Coluna Direita: Comentários */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-600">Comentários</label>
                    <div className="flex flex-col gap-2 p-2 bg-[#f9f9f9] rounded max-h-[150px] overflow-y-auto border border-gray-100">
                      {formData.comentarios.length === 0 ? (
                        <p className="text-xs text-center text-gray-400 py-4">Nenhum comentário ainda.</p>
                      ) : (
                        formData.comentarios.map((com, idx) => (
                          <div key={idx} className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#8b3dff]/20 text-[#6f21e8] flex items-center justify-center text-[10px] font-bold shrink-0">
                              {(com.authorName || 'U').charAt(0)}
                            </div>
                            <div className="bg-white p-2 rounded text-xs text-gray-600 border border-gray-100 flex-1 shadow-sm">
                              {com.content}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="mt-auto pt-2">
                      <input 
                        type="text" 
                        value={novoComentario}
                        onChange={(e) => setNovoComentario(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddComment();
                          }
                        }}
                        placeholder="Escreva um comentário..."
                        disabled={!editingTarefaId}
                        className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded focus:border-[#8b3dff] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex justify-center gap-4 mt-8 pt-4 border-t border-gray-100">
                  {!isReadOnly && (
                    <button
                      type="submit"
                      className="px-10 py-2.5 bg-[#6f21e8] hover:bg-[#5b1bc0] text-white font-bold rounded-lg transition-colors shadow-sm"
                    >
                      Salvar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-10 py-2.5 bg-[#9ca3af] hover:bg-gray-500 text-white font-bold rounded-lg transition-colors shadow-sm"
                  >
                    {isReadOnly ? 'Fechar' : 'Cancelar'}
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
