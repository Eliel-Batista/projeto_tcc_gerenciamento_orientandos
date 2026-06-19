import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useAuthStore } from '@/stores/authStore';
import { parseISO, format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { taskService } from '@/services/taskService';
import { agendaService } from '@/services/agendaService';
import { orientandoService } from '@/services/orientandoService';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const isOrientando = user?.profile === 'ORIENTANDO';
  const firstName = user?.fullName?.split(' ')[0].toLowerCase() || '';

  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [tasksByMonth, setTasksByMonth] = useState<Record<string, number>>({});
  const [myAgenda, setMyAgenda] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [ownTasks, events, orientandos] = await Promise.all([
        taskService.listUserTasks(),
        agendaService.listMeetings(),
        orientandoService.listOrientandos()
      ]);

      const projects = orientandos
        .filter(o => o.status !== 'RECUSADO')
        .map(o => ({
          id: o.id,
          title: o.projeto,
          author: o.nome,
          type: o.tipoCurso
        }));
      setActiveProjects(projects);

      // Para orientadores: busca tarefas de todos os orientandos vinculados
      let tasks = ownTasks;
      if (!isOrientando) {
        const vinculados = orientandos.filter(
          o => o.status === 'VINCULADO' && o.userId
        );
        const orientandoTaskArrays = await Promise.all(
          vinculados.map(o => taskService.listTasksByUser(o.userId!).catch(() => []))
        );
        const orientandoTasks = orientandoTaskArrays.flat();
        // Mescla sem duplicar (orientandos podem ter tarefas atribuídas ao orientador)
        const taskIds = new Set(ownTasks.map(t => t.id));
        tasks = [...ownTasks, ...orientandoTasks.filter(t => !taskIds.has(t.id))];
      }

      const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
      const byMonth = completedTasks.reduce((acc, task) => {
        const dateReference = task.updatedAt || task.dueDate || task.createdAt;
        if (dateReference) {
          try {
            const date = parseISO(dateReference);
            const monthName = format(date, 'MMM', { locale: ptBR });
            const month = monthName.charAt(0).toUpperCase() + monthName.slice(1).replace('.', '');
            acc[month] = (acc[month] || 0) + 1;
          } catch(e) {}
        }
        return acc;
      }, {} as Record<string, number>);
      setTasksByMonth(byMonth);

      const myEvents = isOrientando 
        ? events.filter(e => e.isCreator || e.title.toLowerCase().includes(firstName) || e.title.toLowerCase().includes('ler')) 
        : events;
      
      const todayEvents = myEvents.filter(e => isToday(new Date(e.start)));
      
      const agenda = Array.from({ length: 24 }, (_, i) => {
        const timeStr = `${i.toString().padStart(2, '0')}:00`;
        const eventForHour = todayEvents.find(e => new Date(e.start).getHours() === i);
        
        return {
          time: timeStr,
          event: eventForHour ? eventForHour.title : '',
          type: eventForHour?.type === 'reuniao' ? 'meeting' : (eventForHour ? 'other' : 'none')
        };
      });
      setMyAgenda(agenda);

    } catch (error) {
      console.error(error);
    }
  };

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const mockLineData = months.map(m => ({
    name: m,
    value: tasksByMonth[m] || 0
  }));

  const mockBarData: { name: string; tasks: number }[] = [];

  return (
    <div className="max-w-[1600px] mx-auto">
      <h1 className="text-2xl font-bold text-gray-700 mb-6">Página Inicial</h1>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {!isOrientando && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
            {/* Projetos em Andamento */}
            <h2 className="text-xl font-bold text-gray-700 mb-4">Projetos em andamento</h2>
            <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
              <ul className="space-y-3">
                {activeProjects.length > 0 ? activeProjects.map(p => (
                  <li key={p.id} className="flex items-start gap-2">
                    <span className="text-[#6f21e8] mt-1.5">•</span>
                    <div>
                      <p className="text-[#6f21e8] font-medium text-sm">{p.title}</p>
                      <p className="text-xs text-gray-500">{p.author} - {p.type}</p>
                    </div>
                  </li>
                )) : (
                  <li className="text-sm text-gray-500">Nenhum projeto em andamento no momento.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Agenda do Dia */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
          <h2 className="text-xl font-bold text-gray-700 mb-2">Agenda do dia</h2>
          <div className="text-center mb-4">
            <span className="text-3xl font-light text-gray-700">{format(new Date(), 'dd')}</span>
            <span className="block text-sm text-gray-500 capitalize">{format(new Date(), 'EEEE', { locale: ptBR }).slice(0, 3)}.</span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200"></div>
            
            <div className="space-y-0 relative z-10">
              {myAgenda.map((slot, idx) => (
                <div key={idx} className="flex min-h-[40px] items-stretch group">
                  <div className="w-16 text-right pr-4 text-xs text-gray-500 py-2 flex-shrink-0">
                    {slot.time}
                  </div>
                  <div className="flex-1 border-t border-gray-100 relative pt-1 pb-1">
                    {slot.event && (
                      <div className={`
                        absolute inset-x-0 top-1 bottom-1 ml-2 mr-4 rounded flex items-center px-4 text-white text-sm
                        ${slot.type === 'meeting' ? 'bg-[#5b21b6]' : 'bg-[#8b5cf6]'}
                      `}>
                        {slot.event}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tarefas Realizadas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Tarefas Realizadas</h2>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockLineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {!isOrientando && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
            {/* Tarefas Pendentes */}
            <h2 className="text-xl font-bold text-gray-700 mb-4">Tarefas Pendentes</h2>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={mockBarData} margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#eee" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#666' }} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="tasks" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
