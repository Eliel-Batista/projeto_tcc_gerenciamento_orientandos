import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { deliverableService } from '@/services/deliverableService';
import { taskService } from '@/services/taskService';
import { Button } from '@/components/ui/Button';
import type { Deliverable, Task } from '@/types';

/**
 * Deliverables Page
 * Manage deliverable submissions and feedback
 */
export const Deliverables: React.FC = () => {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');

  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [filePath, setFilePath] = useState('');
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<'APPROVED' | 'REJECTED' | 'REVISION_NEEDED'>('APPROVED');

  // Load deliverables on mount
  useEffect(() => {
    const loadData = async () => {
      if (!taskId) return;

      setLoading(true);
      setError(null);

      try {
        const [deliverablesData, taskData] = await Promise.all([
          deliverableService.listDeliverablesByTask(taskId),
          taskService.getTask(taskId),
        ]);

        setDeliverables(deliverablesData);
        setTask(taskData);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar entregas');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [taskId]);

  const handleSubmit = async () => {
    if (!filePath.trim() || !taskId) return;

    try {
      const newDeliverable = await deliverableService.submitDeliverable(taskId, {
        filePath,
      });

      setDeliverables([...deliverables, newDeliverable]);
      setFilePath('');
      setShowSubmitForm(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleProvideFeedback = async () => {
    if (!selectedDeliverable || !feedback.trim()) return;

    try {
      const updated = await deliverableService.provideFeedback(
        selectedDeliverable.id,
        { feedback, status: feedbackStatus }
      );

      setDeliverables(
        deliverables.map((d) =>
          d.id === updated.id ? updated : d
        )
      );

      setFeedback('');
      setFeedbackStatus('APPROVED');
      setSelectedDeliverable(null);
      setShowFeedbackForm(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (deliverableId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta entrega?')) return;

    try {
      await deliverableService.deleteDeliverable(deliverableId);
      setDeliverables(deliverables.filter((d) => d.id !== deliverableId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'REVISION_NEEDED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Carregando entregas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Entregas</h1>
          {task && (
            <p className="text-gray-600 mt-2">
              Tarefa: <strong>{task.title}</strong>
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Action Button */}
        {!showSubmitForm && (
          <div className="mb-6">
            <Button
              variant="primary"
              onClick={() => setShowSubmitForm(true)}
            >
              Submeter Entrega
            </Button>
          </div>
        )}

        {/* Submit Form */}
        {showSubmitForm && (
          <div className="mb-6 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Submeter Nova Entrega</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caminho do Arquivo
                </label>
                <input
                  type="text"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  placeholder="ex: documentos/relatorio-final.pdf"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={!filePath.trim()}
                >
                  Enviar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowSubmitForm(false);
                    setFilePath('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Deliverables List */}
        <div className="space-y-4">
          {deliverables.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">Nenhuma entrega ainda.</p>
            </div>
          ) : (
            deliverables.map((deliverable) => (
              <div
                key={deliverable.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {deliverable.filePath}
                      </span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(deliverable.status)}`}>
                        {deliverable.status}
                      </span>
                    </div>

                    {deliverable.submissionDate && (
                      <p className="text-sm text-gray-600">
                        Submetido em:{' '}
                        {new Date(deliverable.submissionDate).toLocaleString('pt-BR')}
                      </p>
                    )}

                    {deliverable.feedback && (
                      <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Feedback:
                        </p>
                        <p className="text-sm text-gray-600">{deliverable.feedback}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    {deliverable.status === 'SUBMITTED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedDeliverable(deliverable);
                          setShowFeedbackForm(true);
                        }}
                      >
                        Avaliar
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(deliverable.id)}
                    >
                      Deletar
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Feedback Form Modal */}
        {showFeedbackForm && selectedDeliverable && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Fornecer Feedback</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Escreva seu feedback aqui..."
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={feedbackStatus}
                    onChange={(e) =>
                      setFeedbackStatus(e.target.value as any)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="APPROVED">Aprovado</option>
                    <option value="REJECTED">Rejeitado</option>
                    <option value="REVISION_NEEDED">Revisão Necessária</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowFeedbackForm(false);
                      setSelectedDeliverable(null);
                      setFeedback('');
                      setFeedbackStatus('APPROVED');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleProvideFeedback}
                    disabled={!feedback.trim()}
                  >
                    Enviar Feedback
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
