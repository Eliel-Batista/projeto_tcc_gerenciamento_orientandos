import React from 'react';
import type { Task } from '@/types';
import { TaskStatusBadge } from './TaskStatusBadge';
import { Button } from './ui/Button';

interface TaskItemProps {
  task: Task;
  onSelect: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
}

/**
 * TaskItem Component
 * Reusable task card displaying task details with action buttons
 */
export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onSelect,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const getPriorityStyles = (priority: Task['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-600 font-bold';
      case 'HIGH':
        return 'text-orange-600 font-bold';
      case 'MEDIUM':
        return 'text-yellow-600 font-semibold';
      case 'LOW':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
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

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
  const isCompleted = task.status === 'COMPLETED';

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null;

    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Vencida há ${Math.abs(diffDays)} dias`;
    } else if (diffDays === 0) {
      return 'Vence hoje';
    } else if (diffDays === 1) {
      return 'Vence amanhã';
    } else {
      return `Vence em ${diffDays} dias`;
    }
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja deletar esta tarefa?')) {
      onDelete(task.id);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow p-6 border-l-4 transition-all hover:shadow-lg ${
        isCompleted ? 'border-l-green-500 opacity-75' : isOverdue ? 'border-l-red-500' : 'border-l-blue-500'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 cursor-pointer" onClick={() => onSelect(task)}>
          <div className="flex items-center gap-3 mb-2">
            <h3
              className={`text-lg font-semibold ${
                isCompleted
                  ? 'text-gray-500 line-through'
                  : 'text-gray-900 hover:text-blue-600'
              }`}
            >
              {task.title}
            </h3>
            {isOverdue && task.status !== 'COMPLETED' && (
              <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-800 rounded">
                VENCIDA
              </span>
            )}
          </div>

          {task.description && (
            <p className={`text-sm ${isCompleted ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-3">
            <TaskStatusBadge status={task.status} />

            <span className={`text-sm ${getPriorityStyles(task.priority)}`}>
              {getPriorityLabel(task.priority)}
            </span>

            {task.dueDate && (
              <span
                className={`text-sm font-medium ${
                  isOverdue ? 'text-red-600' : isCompleted ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {formatDueDate(task.dueDate)}
              </span>
            )}

            {task.assignedToUser && (
              <span className="text-sm text-gray-600">
                👤 Atribuído para: {task.assignedToUser.fullName}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(task)}
            title="Editar tarefa"
          >
            ✏️
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            title="Deletar tarefa"
          >
            🗑️
          </Button>
          {task.status !== 'COMPLETED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onStatusChange?.(task.id, 'COMPLETED')}
              title="Marcar como concluída"
            >
              ✓
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
