import React, { useState } from 'react';
import type { Task } from '@/types';
import { TaskStatusBadge } from './TaskStatusBadge';
import { Button } from './ui/Button';
import { TaskForm } from './TaskForm';
import { taskService } from '@/services/taskService';

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
}

/**
 * TaskDetailModal Component
 * Modal showing detailed task information with edit and delete capabilities
 */
export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityLabel = (priority: Task['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return '🔴 Crítica';
      case 'HIGH':
        return '🟠 Alta';
      case 'MEDIUM':
        return '🟡 Média';
      case 'LOW':
        return '🟢 Baixa';
      default:
        return priority;
    }
  };

  const getTaskTypeLabel = (type: Task['taskType']) => {
    switch (type) {
      case 'LEITURA':
        return 'Leitura';
      case 'REUNIAO':
        return 'Reunião';
      case 'ENTREGA':
        return 'Entrega';
      case 'EVENTO':
        return 'Evento';
      case 'OUTRA':
        return 'Outra';
      default:
        return type;
    }
  };

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedTask = await taskService.updateTask(task.id, data);
      onUpdate(updatedTask);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar tarefa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Task['status']) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedTask = await taskService.updateTask(task.id, { status: newStatus });
      onUpdate(updatedTask);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja deletar esta tarefa?')) {
      onDelete(task.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            title="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded">
              {error}
            </div>
          )}

          {isEditing ? (
            <TaskForm
              task={task}
              onSubmit={handleSubmit}
              onCancel={() => setIsEditing(false)}
              isLoading={isLoading}
            />
          ) : (
            <div className="space-y-6">
              {/* Status and Priority */}
              <div className="flex flex-wrap gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Status</p>
                  <TaskStatusBadge status={task.status} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Prioridade</p>
                  <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                    {getPriorityLabel(task.priority)}
                  </span>
                </div>
              </div>

              {/* Description */}
              {task.description && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Descrição</p>
                  <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
                </div>
              )}

              {/* Task Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Tipo de Tarefa</p>
                  <p className="text-gray-900 mt-1">{getTaskTypeLabel(task.taskType)}</p>
                </div>

                {task.dueDate && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Data de Vencimento</p>
                    <p className="text-gray-900 mt-1">
                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}

                {task.assignedToUser && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Atribuído Para</p>
                    <p className="text-gray-900 mt-1">{task.assignedToUser.fullName}</p>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-500">
                  Criada em: {formatDate(task.createdAt)}
                </p>
                <p className="text-xs text-gray-500">
                  Atualizada em: {formatDate(task.updatedAt)}
                </p>
              </div>

              {/* Status Change Buttons */}
              {task.status !== 'COMPLETED' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Mudar Status</p>
                  <div className="flex gap-2 flex-wrap">
                    {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status as Task['status'])}
                        disabled={isLoading}
                        className={`px-3 py-1 text-sm font-semibold rounded transition-colors ${
                          task.status === status
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {status === 'PENDING'
                          ? 'Pendente'
                          : status === 'IN_PROGRESS'
                            ? 'Em Progresso'
                            : status === 'COMPLETED'
                              ? 'Concluída'
                              : 'Cancelada'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isEditing && (
          <div className="border-t border-gray-200 p-6 flex gap-3">
            <Button
              variant="primary"
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isLoading}
            >
              Deletar
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Fechar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
