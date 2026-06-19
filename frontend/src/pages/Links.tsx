import React, { useState, useEffect } from 'react';
import { Search, Library, FilePlus, X, ExternalLink } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';
import { linkService, LinkItem } from '@/services/linkService';
import { orientandoService, Orientando } from '@/services/orientandoService';

export const Links: React.FC = () => {
  const { addToast } = useNotificationStore();
  const { user } = useAuthStore();
  
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [orientandos, setOrientandos] = useState<Orientando[]>([]);

  const isOrientando = user?.profile === 'ORIENTANDO';
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const lks = await linkService.listLinks();
      setLinks(lks);
      
      const oris = await orientandoService.listOrientandos();
      setOrientandos(oris);
    } catch (error) {
      console.error(error);
    }
  };

  const activeOrientandos = orientandos.filter(o => o.status !== 'RECUSADO');

  // The backend already filters: orientador sees their own links, orientando sees links assigned to them + their own
  const visibleLinks = links;

  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState<LinkItem | null>(null);
  
  const [formData, setFormData] = useState({
    titulo: '',
    link: '',
    autor: '',
    comentario: '',
    orientandosIds: [] as string[]
  });
  
  // Estado de Validação
  const [errors, setErrors] = useState({
    link: false,
    autor: false
  });

  const filteredLinks = visibleLinks.filter(l => 
    l.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.comentario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (linkToEdit?: LinkItem) => {
    if (linkToEdit) {
      setCurrentLink(linkToEdit);
      const matchingOrientandos = linkToEdit.assignedUserIds
        ? orientandos.filter(o => linkToEdit.assignedUserIds?.includes(o.userId || ''))
        : [];
      setFormData({
        titulo: linkToEdit.titulo,
        link: linkToEdit.link,
        autor: linkToEdit.autor,
        comentario: linkToEdit.comentario,
        orientandosIds: matchingOrientandos.map(o => o.id)
      });
    } else {
      setCurrentLink(null);
      setFormData({ titulo: '', link: '', autor: '', comentario: '', orientandosIds: [] });
    }
    setErrors({ link: false, autor: false });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentLink(null);
  };

  const isReadOnly = currentLink ? !currentLink.isCreator : false;

  const toggleOrientando = (id: string) => {
    if (isReadOnly) return;
    setFormData(prev => {
      const alreadySelected = prev.orientandosIds.includes(id);
      const newIds = alreadySelected
        ? prev.orientandosIds.filter(oid => oid !== id)
        : [...prev.orientandosIds, id];
      return {
        ...prev,
        orientandosIds: newIds
      };
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = {
      link: !formData.link.trim(),
      autor: !formData.autor.trim()
    };
    
    setErrors(newErrors);

    if (newErrors.link || newErrors.autor) {
      return; 
    }

    try {
      if (currentLink) {
        // Mocking update as backend controller for Links only has POST/GET/DELETE for now
        // A full implementation would need PUT in the backend
        await linkService.deleteLink(currentLink.id);
        await linkService.createLink({
          titulo: formData.titulo.trim() || 'Sem Título',
          link: formData.link.trim(),
          autor: formData.autor.trim(),
          comentario: formData.comentario.trim(),
          assignedUserIds: formData.orientandosIds.map(oid => {
            const o = orientandos.find(or => or.id === oid);
            return o ? o.userId : null;
          }).filter(Boolean) as string[]
        });
        
        addToast({
          id: Date.now().toString(),
          title: 'Link Atualizado',
          message: 'As alterações foram salvas com sucesso.',
          type: 'SUCCESS'
        });
      } else {
        await linkService.createLink({
          titulo: formData.titulo.trim() || 'Sem Título',
          link: formData.link.trim(),
          autor: formData.autor.trim(),
          comentario: formData.comentario.trim(),
          assignedUserIds: formData.orientandosIds.map(oid => {
            const o = orientandos.find(or => or.id === oid);
            return o ? o.userId : null;
          }).filter(Boolean) as string[]
        });
        
        addToast({
          id: Date.now().toString(),
          title: 'Link Adicionado',
          message: 'O link foi criado com sucesso.',
          type: 'SUCCESS'
        });
      }
      
      loadData();
      handleCloseModal();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto relative">
      <h1 className="text-3xl font-bold text-gray-600 mb-8">Organizador de Links</h1>
      
      <div className="flex flex-col gap-4 mb-8">
        <div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-[#8b3dff] hover:bg-[#7b2cff] text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-sm"
          >
            <FilePlus size={20} />
            Adicionar Link
          </button>
        </div>
        
        <div className="relative w-72">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Buscar" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b3dff]/50 text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLinks.map((item) => (
          <div 
            key={item.id} 
            onClick={() => handleOpenModal(item)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 transition-transform hover:translate-y-[-2px] cursor-pointer relative group"
          >
            <div className="flex-1 flex flex-col justify-between h-full">
              <div>
                <h3 className="text-[#6f21e8] font-bold text-lg mb-2 pr-6 group-hover:underline">{item.titulo}</h3>
                <p className="text-gray-400 text-sm leading-snug line-clamp-3 mb-4">
                  {item.comentario}
                </p>
              </div>
              <div className="text-xs font-bold text-gray-500">
                Autor(a): {item.autor}
              </div>
            </div>
            <div className="flex-shrink-0 text-[#8b3dff] opacity-80">
              <Library size={48} strokeWidth={1.5} />
            </div>
          </div>
        ))}
        {filteredLinks.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            Nenhum link encontrado.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white shadow-xl w-full max-w-3xl overflow-hidden flex flex-col relative rounded-lg">
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X size={20} />
            </button>
            
            <div className="p-8 pb-6">
              <h3 className="text-2xl font-bold text-gray-600 mb-6">
                {!currentLink ? 'Adicionar Link' : currentLink.isCreator ? 'Editar Link' : 'Detalhes do Link'}
              </h3>
              
              <form onSubmit={handleAddSubmit} className="flex flex-col gap-6" noValidate>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`flex flex-col gap-1 ${isOrientando ? 'md:col-span-2' : ''}`}>
                    <label htmlFor="titulo" className="text-sm font-bold text-[#6f21e8]">Título</label>
                    <input
                      id="titulo"
                      type="text"
                      disabled={isReadOnly}
                      value={formData.titulo}
                      onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                      className="w-full px-4 py-2 bg-[#f0f0f0] border border-transparent rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b3dff]/50 disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                  
                  {!isOrientando && (
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-bold text-[#6f21e8]">Atribuir a (Orientandos)</label>
                      <div className="flex flex-col gap-2 max-h-32 overflow-y-auto p-3 bg-[#f0f0f0] rounded border border-transparent">
                        {activeOrientandos.length > 0 ? activeOrientandos.map(o => (
                          <label key={o.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-200 p-1 rounded transition-colors">
                            <input 
                              type="checkbox" 
                              disabled={isReadOnly}
                              value={o.id}
                              checked={formData.orientandosIds.includes(o.id)}
                              onChange={() => toggleOrientando(o.id)}
                              className="text-[#8b3dff] focus:ring-[#8b3dff] rounded border-gray-300 w-4 h-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            {o.nome}
                          </label>
                        )) : (
                          <span className="text-xs text-gray-500 italic">Nenhum orientando disponível para atribuição.</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="link" className="text-sm font-bold text-[#6f21e8]">Link</label>
                  <input
                    id="link"
                    type="url"
                    disabled={isReadOnly}
                    value={formData.link}
                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                    className={`w-full px-4 py-2 bg-[#f0f0f0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b3dff]/50 border ${errors.link ? 'border-red-500' : 'border-transparent'} disabled:opacity-70 disabled:cursor-not-allowed`}
                  />
                  {errors.link && <span className="text-red-500 text-xs font-semibold">*Campo obrigatório</span>}
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="autor" className="text-sm font-bold text-[#6f21e8]">Autor(a)</label>
                  <input
                    id="autor"
                    type="text"
                    disabled={isReadOnly}
                    value={formData.autor}
                    onChange={(e) => setFormData({...formData, autor: e.target.value})}
                    className={`w-full px-4 py-2 bg-[#f0f0f0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b3dff]/50 border ${errors.autor ? 'border-red-500' : 'border-transparent'} disabled:opacity-70 disabled:cursor-not-allowed`}
                  />
                  {errors.autor && <span className="text-red-500 text-xs font-semibold">*Campo obrigatório</span>}
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="comentario" className="text-sm font-bold text-[#6f21e8]">Comentário</label>
                  <textarea
                    id="comentario"
                    rows={4}
                    disabled={isReadOnly}
                    value={formData.comentario}
                    onChange={(e) => setFormData({...formData, comentario: e.target.value})}
                    className="w-full px-4 py-2 bg-[#f0f0f0] border border-transparent rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b3dff]/50 resize-none disabled:opacity-70 disabled:cursor-not-allowed"
                  ></textarea>
                </div>

                <div className="flex justify-center gap-4 mt-4">
                  {currentLink && (
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseModal();
                        linkService.deleteLink(currentLink.id).then(() => loadData());
                      }}
                      className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2 mr-auto"
                    >
                      Excluir
                    </button>
                  )}
                  {currentLink && (
                    <button
                      type="button"
                      onClick={() => window.open(formData.link, '_blank')}
                      className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                    >
                      <ExternalLink size={18} />
                      Acessar Link
                    </button>
                  )}
                  
                  {!isReadOnly && (
                    <button
                      type="submit"
                      className="px-8 py-2.5 bg-[#8b3dff] hover:bg-[#7b2cff] text-white font-bold rounded-lg transition-colors shadow-sm min-w-[140px]"
                    >
                      {currentLink ? 'Salvar' : 'Adicionar'}
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-8 py-2.5 bg-[#9ca3af] hover:bg-gray-500 text-white font-bold rounded-lg transition-colors shadow-sm min-w-[140px]"
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
