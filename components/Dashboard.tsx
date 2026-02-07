
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';
import { ServiceEntry, DashboardStats } from '../types';
import { TrendingUp, Users, DollarSign, Activity, Inbox } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface Props {
  data: ServiceEntry[];
}

export const Dashboard: React.FC<Props> = ({ data }) => {
  const stats: DashboardStats = useMemo(() => {
    const revenue = data.reduce((acc, curr) => acc + curr.value, 0);
    
    const byType = data.reduce((acc: any, curr) => {
      acc[curr.serviceType] = (acc[curr.serviceType] || 0) + curr.value;
      return acc;
    }, {});

    const byPayment = data.reduce((acc: any, curr) => {
      acc[curr.paymentMethod] = (acc[curr.paymentMethod] || 0) + curr.value;
      return acc;
    }, {});

    return {
      totalRevenue: revenue,
      serviceCount: data.length,
      averageValue: data.length > 0 ? revenue / data.length : 0,
      revenueByType: Object.keys(byType).map(key => ({ name: key, value: byType[key] })),
      revenueByPayment: Object.keys(byPayment).map(key => ({ name: key, value: byPayment[key] }))
    };
  }, [data]);

  const timelineData = useMemo(() => {
    const dailyMap = data.reduce((acc: any, curr) => {
      const day = new Date(curr.date).getDate();
      acc[day] = (acc[day] || 0) + curr.value;
      return acc;
    }, {});

    return Object.keys(dailyMap)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(day => ({
        date: `Dia ${day}`,
        valor: dailyMap[day]
      }));
  }, [data]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Receita no Mês" value={`R$ ${stats.totalRevenue.toLocaleString()}`} icon={<DollarSign className="text-emerald-500" />} trend="Atual" />
        <StatCard title="Serviços Realizados" value={stats.serviceCount.toString()} icon={<Activity className="text-blue-500" />} trend="Frequência" />
        <StatCard title="Ticket Médio" value={`R$ ${stats.averageValue.toFixed(2)}`} icon={<TrendingUp className="text-amber-500" />} trend="Produtividade" />
        <StatCard title="Clientes Únicos" value={new Set(data.map(d => d.clientName)).size.toString()} icon={<Users className="text-purple-500" />} trend="Alcance" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6 text-slate-800">Mix de Serviços (R$)</h3>
          <div className="h-64">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.revenueByType} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {stats.revenueByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6 text-slate-800">Formas de Recebimento</h3>
          <div className="h-64">
             {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.revenueByPayment}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
             ) : (
               <EmptyState />
             )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Faturamento Diário no Mês</h3>
          </div>
          <div className="h-80">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="h-full flex flex-col items-center justify-center text-slate-400 italic gap-2 opacity-60">
    <Inbox className="w-8 h-8" />
    <span className="text-sm">Sem dados para exibir neste mês</span>
  </div>
);

const StatCard = ({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col group hover:border-emerald-200 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-emerald-50 transition-colors">{icon}</div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{trend}</span>
    </div>
    <span className="text-sm text-slate-500 font-medium">{title}</span>
    <span className="text-2xl font-bold text-slate-900 mt-1">{value}</span>
  </div>
);
