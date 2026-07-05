import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';
import { agendaService, Meeting, MeetingInvite } from '@/services/agendaService';
import { orientandoService, Orientando } from '@/services/orientandoService';
import { FilePlus, X, CheckCircle, XCircle, Clock, CalendarDays, Users } from 'lucide-react';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Gerar horários para o select (00:00 até 23:30)
const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

// Componente de evento customizado para o react-big-calendar
// Garante que o título sempre apareça, mesmo em slots compactos
const EventComponent = ({ event, invites }: { event: any; invites: MeetingInvite[] }) => {
  const isReuniao = event.type === 'reuniao';
  const invite = isReuniao ? invites.find(inv => inv.meetingId === event.id) : null;

  return (
    <div className="flex flex-col leading-tight overflow-hidden h-full px-0.5">
      <div className="flex items-center gap-1">
        {isReuniao && (
          <span className="text-white/80 shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.899L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </span>
        )}
        <span className="font-semibold text-[11px] truncate text-white">
          {event.title || '(sem título)'}
        </span>
      </div>
      {invite?.orientadorNome && !event.isCreator && (
        <span className="text-[10px] text-white/75 truncate">
          {invite.orientadorNome.split(' ')[0]}
        </span>
      )}
    </div>
  );
};

export const Agenda: React.FC = () => {
  const { addToast } = useNotificationStore();
  const { user } = useAuthStore();
  const isOrientando = user?.profile === 'ORIENTANDO';

  const [allEvents, setAllEvents] = useState<Meeting[]>([]);
  const [invites, setInvites] = useState<MeetingInvite[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [meetings, invitesList] = await Promise.all([
        agendaService.listMeetings(),
        agendaService.listInvites().catch(() => [] as MeetingInvite[])
      ]);
      setAllEvents(meetings);
      setInvites(invitesList);
    } catch (error) {
      console.error(error);
    }
  };

  // O backend já retorna apenas reuniões visíveis ao usuário (criadas por ele ou que foi convidado).
  // Não é necessário filtrar adicionalmente no frontend.
  const events = allEvents;



  // Modal State — Cadastro/Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'outro',
    data: '',
    horaInicio: '',
    horaTermino: '',
    descricao: ''
  });

  // Orientandos disponíveis para selecionar na reunião
  const [availableOrientandos, setAvailableOrientandos] = useState<Orientando[]>([]);
  const [selectedOrientandoIds, setSelectedOrientandoIds] = useState<string[]>([]);
  const [orientandosError, setOrientandosError] = useState(false);

  // Validation State
  const [errors, setErrors] = useState({
    titulo: false,
    data: false,
    horaInicio: false,
    horaTermino: false
  });

  // Detalhes e Cancelamento State
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelData, setCancelData] = useState({ justificativa: '' });
  const [cancelError, setCancelError] = useState(false);

  // Modal de Recusa (orientando — convite pendente)
  const [refusingInvite, setRefusingInvite] = useState<MeetingInvite | null>(null);
  const [motivoRecusa, setMotivoRecusa] = useState('');
  const [motivoError, setMotivoError] = useState(false);

  // Modal de Cancelamento (orientando — reunião já aceita, clicada no calendário)
  const [isCancelInviteModalOpen, setIsCancelInviteModalOpen] = useState(false);
  const [cancelInviteMotivo, setCancelInviteMotivo] = useState('');
  const [cancelInviteError, setCancelInviteError] = useState(false);
  // Encontra o convite do orientando para o evento selecionado
  const selectedInvite = selectedEvent
    ? invites.find(inv => inv.meetingId === selectedEvent.id && inv.status === 'ACEITO')
    : null;

  const handleOpenModal = (eventToEdit?: any) => {
    if (eventToEdit) {
      setEditingEventId(eventToEdit.id);
      setFormData({
        titulo: eventToEdit.title,
        tipo: eventToEdit.type || 'outro',
        data: format(eventToEdit.start, 'yyyy-MM-dd'),
        horaInicio: format(eventToEdit.start, 'HH:mm'),
        horaTermino: format(eventToEdit.end, 'HH:mm'),
        descricao: eventToEdit.descricao || ''
      });
      setSelectedEvent(null);
    } else {
      setEditingEventId(null);
      setFormData({ titulo: '', tipo: 'outro', data: '', horaInicio: '', horaTermino: '', descricao: '' });
    }
    setSelectedOrientandoIds([]);
    setOrientandosError(false);
    setErrors({ titulo: false, data: false, horaInicio: false, horaTermino: false });
    setIsModalOpen(true);
    // Carrega orientandos vinculados (apenas para orientador)
    if (!isOrientando) {
      orientandoService.listOrientandos()
        .then(list => setAvailableOrientandos(list.filter(o => o.status === 'VINCULADO')))
        .catch(() => setAvailableOrientandos([]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const [year, month, day] = formData.data ? formData.data.split('-').map(Number) : [0, 0, 0];
    const [startH, startM] = formData.horaInicio ? formData.horaInicio.split(':').map(Number) : [0, 0];
    const [endH, endM] = formData.horaTermino ? formData.horaTermino.split(':').map(Number) : [0, 0];

    const isTimeInvalid = Boolean(formData.horaInicio && formData.horaTermino && (startH * 60 + startM >= endH * 60 + endM));

    const newErrors = {
      titulo: !formData.titulo.trim(),
      data: !formData.data,
      horaInicio: !formData.horaInicio,
      horaTermino: !formData.horaTermino || isTimeInvalid
    };

    setErrors(newErrors);

    if (newErrors.titulo || newErrors.data || newErrors.horaInicio || newErrors.horaTermino) {
      if (isTimeInvalid) {
        addToast({
          id: Date.now().toString(),
          title: 'Horário Inválido',
          message: 'O horário de término não pode ser antes ou igual ao horário de início.',
          type: 'ERROR'
        });
      }
      return;
    }

    const startDate = new Date(year, month - 1, day, startH, startM);
    const endDate = new Date(year, month - 1, day, endH, endM);

    // Valida seleção de orientandos para reuniões (apenas para orientador)
    if (formData.tipo === 'reuniao' && !isOrientando && selectedOrientandoIds.length === 0) {
      setOrientandosError(true);
      addToast({ id: Date.now().toString(), title: 'Selecione os Participantes', message: 'Selecione ao menos um orientando para a reunião.', type: 'ERROR' });
      return;
    }
    setOrientandosError(false);

    try {
      if (editingEventId) {
        await agendaService.deleteMeeting(editingEventId);
        const updated = await agendaService.createMeeting({
          title: formData.titulo,
          type: formData.tipo,
          start: startDate,
          end: endDate,
          descricao: formData.descricao
        }, formData.tipo === 'reuniao' ? selectedOrientandoIds : undefined);
        setAllEvents(prev => [
          ...prev.filter(e => e.id !== editingEventId),
          updated
        ]);
        addToast({ id: Date.now().toString(), title: 'Compromisso Atualizado', message: 'As alterações foram salvas.', type: 'SUCCESS' });
      } else {
        const created = await agendaService.createMeeting({
          title: formData.titulo,
          type: formData.tipo,
          start: startDate,
          end: endDate,
          descricao: formData.descricao
        }, formData.tipo === 'reuniao' ? selectedOrientandoIds : undefined);

        setAllEvents(prev => [...prev, created]);

        const nomes = availableOrientandos
          .filter(o => selectedOrientandoIds.includes(o.userId || o.id))
          .map(o => o.nome.split(' ')[0])
          .join(', ');
        const toastMsg = formData.tipo === 'reuniao'
          ? isOrientando
            ? 'Solicitação de reunião enviada! Seu orientador será notificado.'
            : `Reunião criada! Convites enviados para: ${nomes || 'orientandos selecionados'}.`
          : 'O compromisso foi adicionado à sua agenda.';

        addToast({ id: Date.now().toString(), title: 'Compromisso Criado', message: toastMsg, type: 'SUCCESS' });
      }

      loadData();
      setIsModalOpen(false);
      setSelectedOrientandoIds([]);
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || error?.message || 'Não foi possível salvar o compromisso.';
      addToast({ id: Date.now().toString(), title: 'Erro', message: msg, type: 'ERROR' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await agendaService.deleteMeeting(id);
      setSelectedEvent(null);
      loadData();
      addToast({ id: Date.now().toString(), title: 'Compromisso Apagado', message: 'O compromisso foi removido da agenda.', type: 'INFO' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelData.justificativa.trim()) {
      setCancelError(true);
      return;
    }
    try {
      await agendaService.deleteMeeting(selectedEvent.id);
      setIsCancelModalOpen(false);
      setSelectedEvent(null);
      setCancelData({ justificativa: '' });
      setCancelError(false);
      loadData();
      addToast({ id: Date.now().toString(), title: 'Reunião Cancelada', message: 'A reunião foi cancelada e os envolvidos serão notificados.', type: 'INFO' });
    } catch (error) {
      console.error(error);
    }
  };

  // ── Aceitar convite ────────────────────────────────────────────────────────
  const handleAcceptInvite = async (invite: MeetingInvite) => {
    try {
      await agendaService.respondToInvite(invite.id, 'ACEITO');
      addToast({
        id: Date.now().toString(),
        title: 'Reunião Aceita',
        message: `Você confirmou presença na reunião "${invite.meetingTitle}".`,
        type: 'SUCCESS'
      });
      loadData();
    } catch (error) {
      console.error(error);
      addToast({ id: Date.now().toString(), title: 'Erro', message: 'Não foi possível aceitar o convite.', type: 'ERROR' });
    }
  };

  // ── Abrir modal de recusa ──────────────────────────────────────────────────
  const handleOpenRefuse = (invite: MeetingInvite) => {
    setRefusingInvite(invite);
    setMotivoRecusa('');
    setMotivoError(false);
  };

  // ── Cancelar participação em reunião aceita (orientando via calendário) ──────
  const handleCancelInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelInviteMotivo.trim()) { setCancelInviteError(true); return; }
    if (!selectedInvite) return;
    try {
      const result = await agendaService.cancelInvite(selectedInvite.id, cancelInviteMotivo.trim());
      if (result.action === 'MEETING_DELETED') {
        // Meeting deletado — remove do calendário local
        setAllEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
        addToast({ id: Date.now().toString(), title: 'Reunião Encerrada', message: 'A reunião foi encerrada pois não há mais participantes.', type: 'INFO' });
      } else {
        addToast({ id: Date.now().toString(), title: 'Participação Cancelada', message: 'O orientador foi notificado.', type: 'INFO' });
      }
      setIsCancelInviteModalOpen(false);
      setSelectedEvent(null);
      setCancelInviteMotivo('');
      setCancelInviteError(false);
      loadData();
    } catch (err: any) {
      const msg = err?.response?.data || 'Não foi possível cancelar a participação.';
      addToast({ id: Date.now().toString(), title: 'Erro', message: msg, type: 'ERROR' });
    }
  };

  // ── Confirmar recusa com motivo ────────────────────────────────────────────
  const handleConfirmRefuse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivoRecusa.trim()) {
      setMotivoError(true);
      return;
    }
    if (!refusingInvite) return;
    try {
      await agendaService.respondToInvite(refusingInvite.id, 'RECUSADO', motivoRecusa.trim());
      addToast({
        id: Date.now().toString(),
        title: 'Reunião Recusada',
        message: `Você recusou o convite para "${refusingInvite.meetingTitle}". O orientador será notificado.`,
        type: 'INFO'
      });
      setRefusingInvite(null);
      setMotivoRecusa('');
      loadData();
    } catch (error) {
      console.error(error);
      addToast({ id: Date.now().toString(), title: 'Erro', message: 'Não foi possível recusar o convite.', type: 'ERROR' });
    }
  };

  // ── Cancelar convite enviado (orientador) ──────────────────────────────────
  const handleCancelInviteAsOrientador = async (invite: MeetingInvite) => {
    if (!window.confirm(`Tem certeza que deseja cancelar o convite de ${invite.orientandoNome}?`)) return;
    try {
      await agendaService.cancelInvite(invite.id, 'Cancelado pelo organizador.');
      addToast({
        id: Date.now().toString(),
        title: 'Convite Cancelado',
        message: `O convite para ${invite.orientandoNome} foi cancelado.`,
        type: 'INFO'
      });
      loadData();
    } catch (error) {
      console.error(error);
      addToast({ id: Date.now().toString(), title: 'Erro', message: 'Não foi possível cancelar o convite.', type: 'ERROR' });
    }
  };

  // ── Estilo do evento no calendário ────────────────────────────────────────
  const eventStyleGetter = (event: any) => {
    const isReuniao = event.type === 'reuniao';
    return {
      style: {
        backgroundColor: isReuniao ? '#6f21e8' : '#1d70b8',
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block'
      }
    };
  };

  // ── Painel lateral unificado (ambos os perfis) ──
  // activeInvites: para orientando = pendentes recebidos + pendentes enviados
  //                para orientador = pendentes recebidos + pendentes enviados
  const activeInvites = invites.filter(inv => inv.status === 'PENDENTE');

  const renderPanel = () => (
    <>
      {activeInvites.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Nenhuma solicitação pendente.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {activeInvites.map(inv => (
            <div key={inv.id} className="bg-[#f5f0ff] border border-[#d8c4ff] rounded-lg p-4">
              {/* Cabeçalho do card */}
              <div className="flex items-start gap-2 mb-2">
                <CalendarDays size={16} className="text-[#6f21e8] mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#6f21e8] text-sm leading-tight truncate">{inv.meetingTitle}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {inv.sentByMe
                      ? `Para: ${isOrientando ? inv.orientadorNome : inv.orientandoNome}`
                      : `De: ${isOrientando ? inv.orientadorNome : inv.orientandoNome}`
                    }
                  </p>
                </div>
              </div>

              {/* Data e hora */}
              <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                <Clock size={11} />
                <span>{format(inv.start, 'dd/MM/yyyy')} · {format(inv.start, 'HH:mm')} – {format(inv.end, 'HH:mm')}</span>
              </div>

              {/* Descrição (opcional) */}
              {inv.meetingDescricao && (
                <p className="text-gray-500 text-xs line-clamp-2 mb-2">{inv.meetingDescricao}</p>
              )}

              {/* Ações — sentByMe = aguardando resposta do outro; !sentByMe = precisa responder */}
              {inv.sentByMe ? (
                // O usuário atual enviou este convite → aguardando resposta
                <div className="flex items-center justify-between mt-3">
                  <span className="inline-block bg-[#ede9ff] text-[#6f21e8] text-[10px] font-bold px-2 py-1 rounded">
                    Aguardando resposta
                  </span>
                  {/* Orientando pode cancelar a solicitação que ele mesmo enviou */}
                  <button
                    onClick={() => handleCancelInviteAsOrientador(inv)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-bold transition-colors"
                    title="Cancelar solicitação"
                  >
                    <XCircle size={14} /> Cancelar
                  </button>
                </div>
              ) : (
                // O usuário atual recebeu este convite → pode aceitar ou recusar
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleAcceptInvite(inv)}
                    className="flex-1 flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                  >
                    <CheckCircle size={13} /> Aceitar
                  </button>
                  <button
                    onClick={() => handleOpenRefuse(inv)}
                    className="flex-1 flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                  >
                    <XCircle size={13} /> Recusar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="max-w-[1600px] mx-auto flex flex-row gap-6">

      {/* Área Principal (Calendário) */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[80vh] min-h-[600px] min-w-0">
        <h1 className="text-3xl font-bold text-gray-600 mb-6">Gerenciador da Agenda</h1>

        <div className="mb-6">
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#8b3dff] hover:bg-[#7b2cff] text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-sm"
          >
            <FilePlus size={20} />
            Adicionar Compromisso
          </button>
        </div>

        <div className="flex-1 border border-gray-200 rounded-md overflow-hidden">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            culture="pt-BR"
            defaultView="week"
            views={['day', 'week', 'work_week', 'month']}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => setSelectedEvent(event)}
            components={{
              event: (props: any) => <EventComponent event={props.event} invites={invites} />
            }}
            messages={{
              next: "Próximo",
              previous: "Anterior",
              today: "Hoje",
              month: "Mês",
              week: "Semana",
              day: "Dia",
              work_week: "Semana Útil"
            }}
          />
        </div>

      </div>

      {/* Área Lateral (Solicitações Pendentes) — visível para AMBOS os perfis */}
      <div className="w-72 shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-600 mb-4 border-b pb-3">
          Solicitações Pendentes
          {activeInvites.length > 0 && (
            <span className="ml-2 bg-[#6f21e8] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {activeInvites.length}
            </span>
          )}
        </h2>

        {renderPanel()}
      </div>

      {/* Modal de Cadastro de Compromisso */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white shadow-xl w-full max-w-2xl overflow-hidden flex flex-col relative rounded-lg">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X size={20} />
            </button>

            <div className="p-8 pb-6">
              <h3 className="text-2xl font-bold text-gray-600 mb-8">
                {editingEventId ? 'Editar Compromisso' : 'Cadastrar Compromisso'}
              </h3>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>

                {/* Título e Tipo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="titulo" className="text-sm font-bold text-[#6f21e8]">Título</label>
                    <input
                      id="titulo"
                      type="text"
                      value={formData.titulo}
                      onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                      className={`w-full px-4 py-2 bg-[#f0f0f0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b3dff]/50 border ${errors.titulo ? 'border-red-500' : 'border-transparent'}`}
                    />
                    {errors.titulo && <span className="text-red-500 text-xs font-semibold">*Campo obrigatório</span>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="tipo" className="text-sm font-bold text-[#6f21e8]">Tipo de Compromisso</label>
                    <select
                      id="tipo"
                      value={formData.tipo}
                      onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                      className="w-full px-4 py-2 bg-[#f0f0f0] border border-transparent rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b3dff]/50 appearance-none"
                    >
                      <option value="outro">Compromisso Genérico</option>
                      <option value="reuniao">Reunião</option>
                    </select>
                  </div>
                </div>

                {/* Seleção de orientandos para reunião */}
                {formData.tipo === 'reuniao' && !isOrientando && (
                  <div className={`flex flex-col gap-3 rounded-lg p-4 border ${orientandosError ? 'border-red-400 bg-red-50' : 'border-purple-200 bg-purple-50'}`}>
                    <div className="flex items-center gap-2">
                      <Users size={15} className="text-[#6f21e8] shrink-0" />
                      <span className="text-sm font-bold text-[#6f21e8]">
                        Participantes <span className="text-red-500">*</span>
                      </span>
                    </div>
                    {availableOrientandos.length === 0 ? (
                      <p className="text-xs text-purple-600 italic">Nenhum orientando vinculado encontrado.</p>
                    ) : (
                      <>
                        <div className="flex gap-3 mb-1">
                          <button
                            type="button"
                            onClick={() => setSelectedOrientandoIds(availableOrientandos.map(o => o.userId || o.id))}
                            className="text-xs text-[#6f21e8] hover:underline font-semibold"
                          >
                            Selecionar todos
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={() => setSelectedOrientandoIds([])}
                            className="text-xs text-gray-500 hover:underline font-semibold"
                          >
                            Limpar
                          </button>
                        </div>
                        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                          {availableOrientandos.map(o => {
                            const oid = o.userId || o.id;
                            const checked = selectedOrientandoIds.includes(oid);
                            return (
                              <label
                                key={oid}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                  checked ? 'bg-[#ede9ff] border border-[#6f21e8]/30' : 'bg-white border border-gray-200 hover:border-[#6f21e8]/30'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    setOrientandosError(false);
                                    setSelectedOrientandoIds(prev =>
                                      prev.includes(oid) ? prev.filter(id => id !== oid) : [...prev, oid]
                                    );
                                  }}
                                  className="accent-[#6f21e8] w-4 h-4"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-700 truncate">{o.nome}</p>
                                  <p className="text-xs text-gray-400 truncate">{o.email}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                        {orientandosError && (
                          <span className="text-red-500 text-xs font-semibold">* Selecione ao menos um participante</span>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Data, Inicio, Termino */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="data" className="text-sm font-bold text-[#6f21e8]">Data</label>
                    <input
                      id="data"
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({...formData, data: e.target.value})}
                      className={`w-full px-4 py-2 bg-[#f0f0f0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b3dff]/50 border ${errors.data ? 'border-red-500' : 'border-transparent'}`}
                    />
                    {errors.data && <span className="text-red-500 text-xs font-semibold">*Campo obrigatório</span>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="horaInicio" className="text-sm font-bold text-[#6f21e8]">Hora de Início</label>
                    <select
                      id="horaInicio"
                      value={formData.horaInicio}
                      onChange={(e) => setFormData({...formData, horaInicio: e.target.value})}
                      className={`w-full px-4 py-2 bg-[#f0f0f0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b3dff]/50 border appearance-none ${errors.horaInicio ? 'border-red-500' : 'border-transparent'}`}
                    >
                      <option value="" disabled></option>
                      {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.horaInicio && <span className="text-red-500 text-xs font-semibold">*Campo obrigatório</span>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="horaTermino" className="text-sm font-bold text-[#6f21e8]">Hora do Término</label>
                    <select
                      id="horaTermino"
                      value={formData.horaTermino}
                      onChange={(e) => setFormData({...formData, horaTermino: e.target.value})}
                      className={`w-full px-4 py-2 bg-[#f0f0f0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b3dff]/50 border appearance-none ${errors.horaTermino ? 'border-red-500' : 'border-transparent'}`}
                    >
                      <option value="" disabled></option>
                      {timeOptions.map(t => {
                        const [sh, sm] = formData.horaInicio ? formData.horaInicio.split(':').map(Number) : [0, 0];
                        const [th, tm] = t.split(':').map(Number);
                        const isDisabled = formData.horaInicio ? (th * 60 + tm) <= (sh * 60 + sm) : false;
                        return <option key={t} value={t} disabled={isDisabled} className={isDisabled ? 'text-gray-300' : ''}>{t}</option>;
                      })}
                    </select>
                    {errors.horaTermino && (
                      <span className="text-red-500 text-xs font-semibold">
                        {!formData.horaTermino ? '*Campo obrigatório' : '*Horário inválido'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Descrição */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="descricao" className="text-sm font-bold text-[#6f21e8]">Descrição</label>
                  <textarea
                    id="descricao"
                    rows={3}
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    className="w-full px-4 py-2 bg-[#f0f0f0] border border-transparent rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b3dff]/50 resize-none"
                  ></textarea>
                </div>

                {/* Botões */}
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-[#8b3dff] hover:bg-[#7b2cff] text-white font-bold rounded-lg transition-colors shadow-sm min-w-[140px]"
                  >
                    {editingEventId ? 'Salvar' : 'Cadastrar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-2.5 bg-[#9ca3af] hover:bg-gray-500 text-white font-bold rounded-lg transition-colors shadow-sm min-w-[140px]"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Compromisso */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white shadow-xl w-full max-w-md overflow-hidden flex flex-col relative rounded-lg p-6">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold text-[#6f21e8] mb-6">Detalhes do Compromisso</h3>

            <div className="flex flex-col gap-4 text-gray-700">
              <div>
                <span className="font-bold text-gray-500 block text-sm">Título</span>
                <span className="font-semibold text-lg">{selectedEvent.title}</span>
              </div>
              {selectedEvent.type === 'reuniao' && (
                <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded w-fit">Reunião</span>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-gray-500 block text-sm">Início</span>
                  <span>{format(selectedEvent.start, "dd/MM/yyyy HH:mm")}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500 block text-sm">Término</span>
                  <span>{format(selectedEvent.end, "dd/MM/yyyy HH:mm")}</span>
                </div>
              </div>
              {selectedEvent.descricao && (
                <div>
                  <span className="font-bold text-gray-500 block text-sm">Descrição</span>
                  <div className="p-3 bg-gray-50 rounded border border-gray-100 text-sm whitespace-pre-wrap mt-1">
                    {selectedEvent.descricao}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t pt-4">
              {/* Orientador: cancelar reunião inteira */}
              {selectedEvent.type === 'reuniao' && selectedEvent.isCreator && (
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded transition-colors shadow-sm"
                >
                  Cancelar Reunião
                </button>
              )}
              {/* Orientador: apagar/editar compromisso genérico */}
              {selectedEvent.type !== 'reuniao' && selectedEvent.isCreator && (
                <>
                  <button
                    onClick={() => handleDelete(selectedEvent.id)}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded transition-colors shadow-sm"
                  >
                    Apagar
                  </button>
                  <button
                    onClick={() => handleOpenModal(selectedEvent)}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded transition-colors shadow-sm"
                  >
                    Editar
                  </button>
                </>
              )}
              {/* Orientando: cancelar participação em reunião aceita */}
              {selectedEvent.type === 'reuniao' && !selectedEvent.isCreator && selectedInvite && (
                <button
                  onClick={() => { setIsCancelInviteModalOpen(true); setCancelInviteMotivo(''); setCancelInviteError(false); }}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded transition-colors shadow-sm"
                >
                  Cancelar Participação
                </button>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-6 py-2 bg-[#9ca3af] hover:bg-gray-500 text-white font-bold rounded-lg transition-colors shadow-sm ml-auto"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Justificativa (Cancelar Reunião — Orientador) */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white shadow-xl w-full max-w-lg overflow-hidden flex flex-col relative rounded-lg p-6">
            <button
              onClick={() => {
                setIsCancelModalOpen(false);
                setCancelData({ justificativa: '' });
                setCancelError(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold text-red-600 mb-6">Cancelar Reunião</h3>

            <form onSubmit={handleCancelMeetingSubmit} className="flex flex-col gap-4">
              <p className="text-gray-600 text-sm">
                Tem certeza que deseja cancelar a reunião <strong>{selectedEvent?.title}</strong>? Esta ação notificará todos os participantes.
              </p>

              <div className="flex flex-col gap-1">
                <label htmlFor="justificativa" className="text-sm font-bold text-gray-700">Justificativa (Obrigatório)</label>
                <textarea
                  id="justificativa"
                  rows={4}
                  value={cancelData.justificativa}
                  onChange={(e) => setCancelData({ justificativa: e.target.value })}
                  placeholder="Explique o motivo do cancelamento..."
                  className={`w-full px-4 py-2 bg-[#f0f0f0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/50 border resize-none ${cancelError ? 'border-red-500' : 'border-transparent'}`}
                ></textarea>
                {cancelError && <span className="text-red-500 text-xs font-semibold">* A justificativa é obrigatória</span>}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCancelModalOpen(false);
                    setCancelData({ justificativa: '' });
                    setCancelError(false);
                  }}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-sm"
                >
                  Confirmar Cancelamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cancelamento de Participação (Orientando — clicou no evento do calendário) */}
      {isCancelInviteModalOpen && selectedInvite && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white shadow-xl w-full max-w-lg overflow-hidden flex flex-col relative rounded-lg p-6">
            <button
              onClick={() => { setIsCancelInviteModalOpen(false); setCancelInviteMotivo(''); setCancelInviteError(false); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold text-red-600 mb-2">Cancelar Participação</h3>
            <p className="text-gray-500 text-sm mb-6">
              Você está cancelando sua participação na reunião{' '}
              <strong className="text-gray-700">"{selectedEvent?.title}"</strong>.
              O orientador será notificado com o motivo informado.
            </p>

            <form onSubmit={handleCancelInviteSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="cancelInviteMotivo" className="text-sm font-bold text-gray-700">
                  Motivo do Cancelamento <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="cancelInviteMotivo"
                  rows={4}
                  value={cancelInviteMotivo}
                  onChange={(e) => { setCancelInviteMotivo(e.target.value); setCancelInviteError(false); }}
                  placeholder="Descreva o motivo pelo qual não poderá comparecer..."
                  className={`w-full px-4 py-2 bg-[#f0f0f0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/50 border resize-none ${cancelInviteError ? 'border-red-500' : 'border-transparent'}`}
                />
                {cancelInviteError && <span className="text-red-500 text-xs font-semibold">* O motivo é obrigatório</span>}
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => { setIsCancelInviteModalOpen(false); setCancelInviteMotivo(''); setCancelInviteError(false); }}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-sm"
                >
                  Confirmar Cancelamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Recusa (Orientando) */}
      {refusingInvite && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white shadow-xl w-full max-w-lg overflow-hidden flex flex-col relative rounded-lg p-6">
            <button
              onClick={() => { setRefusingInvite(null); setMotivoRecusa(''); setMotivoError(false); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold text-red-600 mb-2">Recusar Convite de Reunião</h3>
            <p className="text-gray-500 text-sm mb-6">
              Você está recusando o convite para a reunião <strong className="text-gray-700">"{refusingInvite.meetingTitle}"</strong>.
              Por favor, informe o motivo para que o orientador possa ser notificado.
            </p>

            <form onSubmit={handleConfirmRefuse} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="motivoRecusa" className="text-sm font-bold text-gray-700">
                  Motivo da Recusa <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="motivoRecusa"
                  rows={4}
                  value={motivoRecusa}
                  onChange={(e) => { setMotivoRecusa(e.target.value); setMotivoError(false); }}
                  placeholder="Descreva o motivo pelo qual não poderá comparecer..."
                  className={`w-full px-4 py-2 bg-[#f0f0f0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/50 border resize-none ${motivoError ? 'border-red-500' : 'border-transparent'}`}
                ></textarea>
                {motivoError && <span className="text-red-500 text-xs font-semibold">* O motivo da recusa é obrigatório</span>}
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => { setRefusingInvite(null); setMotivoRecusa(''); setMotivoError(false); }}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-sm"
                >
                  Confirmar Recusa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
