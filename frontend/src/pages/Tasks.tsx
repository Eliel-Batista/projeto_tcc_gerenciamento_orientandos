import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Task, TaskCreateRequest } from '@/types';
import { useTaskStore } from '@/stores/taskStore';
import { taskService } from '@/services/taskService';
import { TaskItem } from '@/components/TaskItem';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { TaskForm } from '@/components/TaskForm';
import { Button } from '@/components/ui/Button';

/**
 * Tasks Page
 * Main task management interface with filtering, sorting, and CRUD operations
 */
export const Tasks: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const {
    tasks,
    selectedTask,
    loading,
    error,
    fetchTasksByProject,
    fetchUserTasks,
    selectTask,
    clearSelectedTask,
    resetFilters,
    addTask,
    updateTaskLocal,
    removeTask,
    setError: setStoreError,
    clearError,
  } = useTaskStore();

  // Local state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<Task['status'] | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<Task['priority'] | ''>('');
  

  // Load tasks on component mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        if (projectId) {
          await fetchTasksByProject(projectId);
        } else {
          await fetchUserTasks();
        }
      } catch (err) {
        // Error is handled by store
      }
    };

    loadTasks();
  }, [projectId, fetchTasksByProject, fetchUserTasks]);

  // Apply filters and sorting
  const filteredTasks = tasks
    .filter((task) => {
      if (statusFilter && task.status !== statusFilter) return false;
      if (priorityFilter && task.priority !== priorityFilter) return false;
      return true;
    })
    .sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortBy) {
        case 'dueDate':
          aVal = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          bVal = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          break;
        case 'priority': {
          const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          aVal = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 0;
          bVal = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 0;
          break;
        }
        case 'created':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

  const handleCreateTask = async (data: TaskCreateRequest | import('@/types').TaskUpdateRequest) => {
    if (!projectId) {
      setStoreError('Project ID is required to create a task');
      return;
    }

    setIsSubmitting(true);
    try {
      const createData = data as TaskCreateRequest;
      const newTask = await taskService.createTask(projectId, createData);
      addTask(newTask);
      setShowCreateForm(false);
      clearError();
    } catch (err: any) {
      setStoreError(err.message || 'Erro ao criar tarefa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    updateTaskLocal(updatedTask.id, updatedTask);
    clearSelectedTask();
  };

  const handleDeleteTask = async (taskId: string) => {
    setIsSubmitting(true);
    try {
      await taskService.deleteTask(taskId);
      removeTask(taskId);
      clearError();
    } catch (err: any) {
      setStoreError(err.message || 'Erro ao deletar tarefa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    setIsSubmitting(true);
    try {
      const updatedTask = await taskService.updateTask(taskId, { status: newStatus });
      updateTaskLocal(taskId, updatedTask);
    } catch (err: any) {
      setStoreError(err.message || 'Erro ao atualizar status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tarefas</h1>
          <p className="text-gray-600">
            {projectId
              ? 'Tarefas do projeto'
              : 'Suas tarefas e atribuições'}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Actions Bar */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:justify-between md:items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Filtros e Ações</h2>
            <Button
              variant="primary"
              onClick={() => setShowCreateForm(true)}
              disabled={!projectId || loading}
            >
              + Nova Tarefa
            </Button>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Task['status'] | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Todos</option>
                <option value="PENDING">Pendente</option>
                <option value="IN_PROGRESS">Em Progresso</option>
                <option value="COMPLETED">Concluída</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prioridade
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as Task['priority'] | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Todas</option>
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ordenar Por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="dueDate">Data de Vencimento</option>
                <option value="priority">Prioridade</option>
                <option value="created">Data de Criação</option>
              </select>
            </div>

            {/* Reset Filters */}
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setStatusFilter('');
                  setPriorityFilter('');
                  setSortBy('dueDate');
                  setSortOrder('asc');
                  resetFilters();
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4 text-sm text-gray-600">
            <p>
              Exibindo{' '}
              <span className="font-semibold text-gray-900">{filteredTasks.length}</span> de{' '}
              <span className="font-semibold text-gray-900">{tasks.length}</span> tarefas
            </p>
          </div>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6 border-l-4 border-l-blue-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Nova Tarefa</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setShowCreateForm(false)}
              isLoading={isSubmitting}
            />
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Carregando tarefas...</p>
              <div className="mt-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-gray-200 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>
          )}

          {!loading && filteredTasks.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600 text-lg mb-4">
                {statusFilter || priorityFilter ? 'Nenhuma tarefa encontrada com os filtros aplicados' : 'Nenhuma tarefa ainda'}
              </p>
              {!projectId && (
                <p className="text-gray-500 mb-4">Crie uma nova tarefa para começar</p>
              )}
              {projectId && (
                <Button variant="primary" onClick={() => setShowCreateForm(true)}>
                  + Criar Primeira Tarefa
                </Button>
              )}
            </div>
          )}

          {!loading &&
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onSelect={selectTask}
                onEdit={(task) => {
                  selectTask(task);
                  // Detail modal will handle edit
                }}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={clearSelectedTask}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
};
