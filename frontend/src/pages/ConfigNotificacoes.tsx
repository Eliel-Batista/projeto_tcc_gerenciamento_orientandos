import React, { useState, useRef, useEffect } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { ChevronDown } from 'lucide-react';

// Opções Constantes
const TIPOS_NOTIFICACAO = [
  { id: 't1', label: 'Reunião marcada' },
  { id: 't2', label: 'Reunião cancelada' },
  { id: 't3', label: 'Prazos de metas' },
  { id: 't4', label: 'Menu item' },
  { id: 't5', label: 'Notificações do sistema' },
  { id: 't6', label: 'Nova atividade atribuída' }
];

const CANAIS_NOTIFICACAO = [
  { id: 'c1', label: 'E-mail institucional' },
  { id: 'c2', label: 'Notificação do sistema' }
];

const FREQUENCIA_NOTIFICACAO = [
  { id: 'f1', label: 'Em tempo real' },
  { id: 'f2', label: 'Resumo semanal' }
];

const defaultSettings = {
  tipos: TIPOS_NOTIFICACAO.map(t => t.id),
  canais: ['c1'],
  frequencia: ['f1']
};

// Componente de Dropdown Customizado (Multi-Select)
interface DropdownProps {
  label: string;
  options: { id: string; label: string }[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  primaryValueLabel: string;
}

const MultiSelectDropdown: React.FC<DropdownProps> = ({ label, options, selectedIds, onChange, primaryValueLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(item => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="flex flex-col gap-2 relative w-full max-w-xs" ref={dropdownRef}>
      <label className="text-sm font-bold text-[#6f21e8]">{label}</label>
      
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-[#f0f0f0] border border-transparent rounded focus:outline-none focus:ring-2 focus:ring-[#8b3dff]/50 text-sm text-gray-700"
      >
        <span className="truncate">{selectedIds.length > 0 ? primaryValueLabel : 'Selecione...'}</span>
        <ChevronDown size={16} className="text-gray-500 flex-shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-[#f3edfd] rounded-md shadow-lg border border-[#e5d9f9] z-50 overflow-hidden">
          <div className="flex flex-col max-h-64 overflow-y-auto py-1">
            {options.map(option => (
              <label 
                key={option.id} 
                className="flex items-center justify-between px-4 py-2.5 hover:bg-[#e9dcfc] cursor-pointer transition-colors"
              >
                <span className="text-sm text-gray-700">{option.label}</span>
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(option.id)}
                  onChange={() => toggleOption(option.id)}
                  className="w-4 h-4 text-[#8b3dff] rounded border-gray-300 focus:ring-[#8b3dff] bg-white cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const ConfigNotificacoes: React.FC = () => {
  const { addToast } = useNotificationStore();
  
  // States
  const [tipos, setTipos] = useState<string[]>(defaultSettings.tipos);
  const [canais, setCanais] = useState<string[]>(defaultSettings.canais);
  const [frequencia, setFrequencia] = useState<string[]>(defaultSettings.frequencia);

  const handleSave = () => {
    addToast({
      id: Date.now().toString(),
      title: 'Configurações Salvas',
      message: 'Suas preferências de notificação foram atualizadas com sucesso.',
      type: 'SUCCESS'
    });
  };

  const handleCancel = () => {
    addToast({
      id: Date.now().toString(),
      title: 'Ação Cancelada',
      message: 'As alterações não foram salvas.',
      type: 'INFO'
    });
  };

  const handleRestore = () => {
    setTipos(defaultSettings.tipos);
    setCanais(defaultSettings.canais);
    setFrequencia(defaultSettings.frequencia);
    addToast({
      id: Date.now().toString(),
      title: 'Padrão Restaurado',
      message: 'As configurações voltaram ao formato padrão.',
      type: 'INFO'
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto p-8 h-full flex flex-col relative">
      <h1 className="text-3xl font-bold text-gray-600 mb-12">Configurar Notificações</h1>
      
      <div className="flex flex-col gap-8 flex-1">
        <MultiSelectDropdown 
          label="Tipos de Notificação"
          options={TIPOS_NOTIFICACAO}
          selectedIds={tipos}
          onChange={setTipos}
          primaryValueLabel="Reunião marcada"
        />
        
        <MultiSelectDropdown 
          label="Canais de Notificação"
          options={CANAIS_NOTIFICACAO}
          selectedIds={canais}
          onChange={setCanais}
          primaryValueLabel="E-mail institucional"
        />
        
        <MultiSelectDropdown 
          label="Frequência das Notificações"
          options={FREQUENCIA_NOTIFICACAO}
          selectedIds={frequencia}
          onChange={setFrequencia}
          primaryValueLabel="Em tempo real"
        />
      </div>

      <div className="mt-auto flex justify-center items-center gap-4 pt-12">
        <button
          onClick={handleSave}
          className="px-12 py-2.5 bg-[#8b3dff] hover:bg-[#7b2cff] text-white font-bold rounded-lg transition-colors shadow-sm min-w-[140px]"
        >
          Salvar
        </button>
        <button
          onClick={handleCancel}
          className="px-12 py-2.5 bg-[#9ca3af] hover:bg-gray-500 text-white font-bold rounded-lg transition-colors shadow-sm min-w-[140px]"
        >
          Cancelar
        </button>
        <button
          onClick={handleRestore}
          className="px-12 py-2.5 bg-[#9ca3af] hover:bg-gray-500 text-white font-bold rounded-lg transition-colors shadow-sm min-w-[140px]"
        >
          Restaurar Padrão
        </button>
      </div>
    </div>
  );
};
