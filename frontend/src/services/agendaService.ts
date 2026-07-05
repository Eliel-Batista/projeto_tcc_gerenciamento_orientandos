import { api } from '@/lib/axios';

export interface Meeting {
  id: string;
  title: string;
  type: string;
  isCreator: boolean;
  start: Date;
  end: Date;
  descricao?: string;
}

export interface MeetingInvite {
  id: string;
  meetingId: string;
  meetingTitle: string;
  meetingDescricao?: string;
  start: Date;
  end: Date;
  orientadorNome: string;
  orientandoNome: string;
  status: 'PENDENTE' | 'ACEITO' | 'RECUSADO';
  motivoRecusa?: string;
  sentByMe: boolean;
}

/**
 * Converte datas vindas da API — aceita string ISO ou array numérico [y,m,d,h,min,s]
 * que o Jackson pode emitir quando write-dates-as-timestamps não está desabilitado.
 */
function parseDate(value: any): Date {
  if (!value) return new Date();
  // Array numérico: [2026, 6, 5, 10, 30] ou [2026, 6, 5, 10, 30, 0]
  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    return new Date(year, month - 1, day, hour, minute, second);
  }
  // String ISO: "2026-06-05T10:30:00"
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (match && !value.endsWith('Z') && !value.includes('+') && !value.match(/-\d{2}:\d{2}$/)) {
      const [, y, m, d, h, min, s] = match;
      return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s));
    }
  }
  return new Date(value);
}

function toLocalISOString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function mapMeeting(m: any): Meeting {
  return {
    id: m.id,
    title: m.title,
    type: m.type,
    isCreator: m.isCreator ?? m.creator ?? false,
    descricao: m.descricao,
    start: parseDate(m.start),
    end: parseDate(m.end),
  };
}

function mapInvite(inv: any): MeetingInvite {
  return {
    id: inv.id,
    meetingId: inv.meetingId,
    meetingTitle: inv.meetingTitle,
    meetingDescricao: inv.meetingDescricao,
    orientadorNome: inv.orientadorNome,
    orientandoNome: inv.orientandoNome,
    status: inv.status,
    motivoRecusa: inv.motivoRecusa,
    sentByMe: inv.sentByMe ?? false,
    start: parseDate(inv.start),
    end: parseDate(inv.end),
  };
}

export const agendaService = {
  async listMeetings(): Promise<Meeting[]> {
    const response = await api.get<any[]>('/meetings');
    return response.data.map(mapMeeting);
  },

async createMeeting(
    meeting: Omit<Meeting, 'id' | 'isCreator'>,
    orientandoIds?: string[]
  ): Promise<Meeting> {
    const response = await api.post<any>('/meetings', {
      title: meeting.title,
      type: meeting.type,
      descricao: meeting.descricao,
      start: meeting.start instanceof Date ? toLocalISOString(meeting.start) : meeting.start,
      end: meeting.end instanceof Date ? toLocalISOString(meeting.end) : meeting.end,
      orientandoIds: orientandoIds && orientandoIds.length > 0 ? orientandoIds : null,
    });
    return mapMeeting(response.data);
  },


  async deleteMeeting(id: string): Promise<void> {
    await api.delete(`/meetings/${id}`);
  },

  async listInvites(): Promise<MeetingInvite[]> {
    const response = await api.get<any[]>('/meetings/invites');
    return response.data.map(mapInvite);
  },

  async respondToInvite(
    inviteId: string,
    action: 'ACEITO' | 'RECUSADO',
    motivo?: string
  ): Promise<MeetingInvite> {
    const response = await api.put<any>(`/meetings/invites/${inviteId}/respond`, {
      action,
      motivo: motivo || ''
    });
    return mapInvite(response.data);
  },

  /**
   * Orientando cancela participação em uma reunião que já aceitou.
   * Retorna { action: 'MEETING_DELETED' | 'INVITE_CANCELLED', message: string }
   */
  async cancelInvite(inviteId: string, motivo: string): Promise<{ action: string; message: string }> {
    const response = await api.post<any>(`/meetings/invites/${inviteId}/cancel`, { motivo });
    return response.data;
  }
};
