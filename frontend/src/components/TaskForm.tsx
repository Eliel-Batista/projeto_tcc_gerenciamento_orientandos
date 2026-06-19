import React, { useState } from 'react';
import type { Task, TaskCreateRequest, TaskUpdateRequest } from '@/types';
import { Button } from './ui/Button';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskCreateRequest | TaskUpdateRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * TaskForm Component
 * Form for creating or editing tasks with validation
 */
export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<TaskCreateRequest | TaskUpdateRequest>(
    task ? {
      title: task.title,
      description: task.description,
      taskType: task.taskType,
      status: task.status,
      dueDate: task.dueDate,
      priority: task.priority,
      assignedToId: task.assignedTo,
    } : {
      title: '',
      description: '',
      taskType: 'REUNIAO',
      status: 'PENDING',
      dueDate: '',
      priority: 'MEDIUM',
      assignedToId: '',
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title || formData.title.trim().length < 3) {
      newErrors.title = 'Título deve ter no mínimo 3 caracteres';
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today && !task) {
        newErrors.dueDate = 'Data de vencimento deve ser no futuro';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' && name !== 'title' && name !== 'description' ? undefined : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error: any) {
      setSubmitError(error.message || 'Erro ao salvar tarefa');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded">
          {submitError}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Título *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Digite o título da tarefa"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.title
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          disabled={isLoading}
        />
        {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Descrição
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Digite a descrição da tarefa"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* Task Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tipo de Tarefa
        </label>
        <select
          name="taskType"
          value={formData.taskType}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="LEITURA">Leitura</option>
          <option value="REUNIAO">Reunião</option>
          <option value="ENTREGA">Entrega</option>
          <option value="EVENTO">Evento</option>
          <option value="OUTRA">Outra</option>
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="PENDING">Pendente</option>
          <option value="IN_PROGRESS">Em Progresso</option>
          <option value="COMPLETED">Concluída</option>
          <option value="CANCELLED">Cancelada</option>
        </select>
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Prioridade *
        </label>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="LOW">Baixa</option>
          <option value="MEDIUM">Média</option>
          <option value="HIGH">Alta</option>
        </select>
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Data de Vencimento
        </label>
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate || ''}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.dueDate
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          disabled={isLoading}
        />
        {errors.dueDate && <p className="text-red-600 text-sm mt-1">{errors.dueDate}</p>}
      </div>

      {/* Assigned To */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Atribuído Para (ID do Usuário)
        </label>
        <input
          type="text"
          name="assignedToId"
          value={formData.assignedToId || ''}
          onChange={handleChange}
          placeholder="ID do usuário (opcional)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {isLoading ? 'Salvando...' : task ? 'Atualizar' : 'Criar Tarefa'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
};
