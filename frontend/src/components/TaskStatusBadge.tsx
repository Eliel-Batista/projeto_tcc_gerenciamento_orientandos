import React from 'react';
import type { Task } from '@/types';

interface TaskStatusBadgeProps {
  status: Task['status'];
  className?: string;
}

/**
 * TaskStatusBadge Component
 * Displays task status with color-coded badge
 * PENDING: Gray, IN_PROGRESS: Blue, COMPLETED: Green, CANCELLED: Red
 */
export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const getStatusStyles = (status: Task['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'IN_PROGRESS':
        return 'Em Progresso';
      case 'COMPLETED':
        return 'Concluída';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusStyles(
        status
      )} ${className}`}
    >
      {getStatusLabel(status)}
    </span>
  );
};
