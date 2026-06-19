import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { orientandoService } from '@/services/orientandoService';

const NotificationsBell: React.FC = () => {
  const { notifications, unreadCount, loadNotifications, markAsRead, markAllRead } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<any>(null);

  useEffect(() => {
    // Load notifications on mount so the unread count shows immediately
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    // Refresh notifications when the dropdown is opened
    if (open) {
      loadNotifications();
    }
  }, [open, loadNotifications]);

  const navigate = useNavigate();

  const goToRelated = (n: any) => {
    markAsRead(n.id).catch(() => {});
    if (n.relatedEntity === 'deliverable') {
      navigate('/deliverables');
      return;
    }
    if (n.relatedEntity === 'task') {
      navigate('/tasks');
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="relative">
      <button
        aria-label="Notificações"
        onClick={() => {
          if (!open && unreadCount > 0) {
            markAllRead();
          }
          setOpen((v) => !v);
        }}
        className="relative p-2 rounded hover:bg-gray-100"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs px-1.5">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white border rounded-lg shadow-lg z-50 transition-opacity duration-150">
          <div className="p-3 border-b flex justify-between items-center">
            <strong>Notificações</strong>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-sm text-blue-600 hover:underline"
              >
                Marcar todas lidas
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-auto">
            {notifications.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">Sem notificações</div>
            ) : (
              notifications.map((n) => {
                if (n.type === 'LINK_REQUEST' && useAuthStore.getState().user?.profile === 'ORIENTADOR') {
                  return null;
                }

                const type = n.type || 'INFO';
                const color =
                  type === 'SUCCESS' ? 'bg-green-50' : type === 'WARNING' ? 'bg-yellow-50' : type === 'ERROR' ? 'bg-red-50' : type === 'REMINDER' ? 'bg-purple-50' : 'bg-blue-50';

                const isLinkRequest = n.type === 'LINK_REQUEST';

                return (
                  <div
                    key={n.id}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer flex gap-3 items-start ${n.readAt ? 'opacity-80' : 'bg-white'}`}
                    onClick={(e) => {
                      if (isLinkRequest) {
                        e.stopPropagation();
                        setSelectedInvite(n);
                        setOpen(false);
                      } else {
                        goToRelated(n);
                      }
                    }}
                  >
                    {/* Ícone da notificação */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${isLinkRequest ? 'bg-purple-50 border-purple-200' : color}`}>
                      {isLinkRequest ? (
                        <svg className="w-5 h-5 text-[#6f21e8]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="text-sm font-semibold text-gray-900">{n.title}</div>
                        <div className="text-xs text-gray-400 shrink-0">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>

                      {/* Detalhes do orientador para LINK_REQUEST */}
                      {isLinkRequest && n.message ? (
                        <div className="mt-1.5 bg-purple-50 border border-purple-100 rounded-md px-3 py-2 text-xs text-gray-700 leading-relaxed">
                          {n.message}
                        </div>
                      ) : (
                        n.message && <div className="text-xs text-gray-600 mt-1">{n.message}</div>
                      )}

                      <div className="mt-2 flex items-center gap-3">
                        {isLinkRequest ? (
                          <>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (n.relatedEntity) {
                                  try {
                                    await orientandoService.updateStatus(n.relatedEntity, 'VINCULADO');
                                    window.location.reload();
                                  } catch (err) {
                                    console.error(err);
                                    alert("Erro ao aceitar convite.");
                                  }
                                }
                              }}
                              className="text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded transition-colors"
                            >
                              Aceitar
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (n.relatedEntity) {
                                  try {
                                    await orientandoService.updateStatus(n.relatedEntity, 'RECUSADO');
                                    window.location.reload();
                                  } catch (err) {
                                    console.error(err);
                                    alert("Erro ao recusar convite.");
                                  }
                                }
                              }}
                              className="text-xs font-bold text-red-600 border border-red-600 hover:bg-red-50 px-3 py-1.5 rounded transition-colors"
                            >
                              Recusar
                            </button>
                          </>
                        ) : (
                          !n.readAt && (
                            <button
                              onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Marcar lida
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="p-3 border-t text-sm text-center">
            <button onClick={() => { setOpen(false); window.location.href = '/notifications'; }} className="text-blue-600 hover:underline">Ver todas as notificações</button>
          </div>
        </div>
      )}

      {/* Invite Modal Pop-up via Portal */}
      {selectedInvite && createPortal(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-0 relative overflow-hidden">
            <div className="bg-gradient-to-r from-[#6f21e8] to-[#8b3dff] p-6 text-white">
              <h2 className="text-xl font-bold mb-1">Convite de Orientação</h2>
              <p className="text-purple-100 text-sm">Você recebeu um novo pedido de vínculo</p>
            </div>
            
            <div className="p-6">
              {(() => {
                const match = selectedInvite.message?.match(/Prof\. (.*) \((.*)\) convidou você para o projeto: (.*)/);
                if (match) {
                  const [, nome, email, projeto] = match;
                  return (
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#6f21e8] font-bold shrink-0">
                          {nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Orientador</p>
                          <p className="font-bold text-gray-900">{nome}</p>
                          <p className="text-sm text-gray-600">{email}</p>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Projeto</p>
                        <p className="font-medium text-gray-900 mt-0.5">{projeto}</p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {selectedInvite.message}
                    </p>
                  </div>
                );
              })()}
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={async () => {
                    try {
                      if (selectedInvite.relatedEntity) {
                        await orientandoService.updateStatus(selectedInvite.relatedEntity, 'RECUSADO');
                      }
                      await markAsRead(selectedInvite.id);
                      setSelectedInvite(null);
                      window.location.reload();
                    } catch (err) {
                      console.error(err);
                      alert("Erro ao recusar convite.");
                    }
                  }}
                  className="px-5 py-2 text-sm font-bold text-red-600 border-2 border-red-100 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                  Recusar
                </button>
                <button
                  onClick={async () => {
                    try {
                      if (selectedInvite.relatedEntity) {
                        await orientandoService.updateStatus(selectedInvite.relatedEntity, 'VINCULADO');
                      }
                      await markAsRead(selectedInvite.id);
                      setSelectedInvite(null);
                      window.location.reload();
                    } catch (err) {
                      console.error(err);
                      alert("Erro ao aceitar convite.");
                    }
                  }}
                  className="px-5 py-2 text-sm font-bold text-white bg-[#22c55e] hover:bg-[#16a34a] rounded-lg shadow-sm transition-colors"
                >
                  Aceitar Convite
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedInvite(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default NotificationsBell;
