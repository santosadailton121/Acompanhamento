
import React, { useState, useEffect, useMemo } from 'react';
import { AppTab, ServiceEntry } from './types';
import { Dashboard } from './components/Dashboard';
import { ServiceManager } from './components/ServiceManager';
import { AIConsultant } from './components/AIConsultant';
import { MediaLab } from './components/MediaLab';
import { 
  LayoutDashboard, ReceiptText, Bot, Camera, Menu, X, 
  Wallet, ChevronLeft, ChevronRight, Calendar, Database, HardDrive, AlertTriangle
} from 'lucide-react';

// Chave definitiva para evitar perda de dados
const CURRENT_STORAGE_KEY = 'finanservice_v2_data';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Lógica de carregamento e migração
  const [entries, setEntries] = useState<ServiceEntry[]>(() => {
    try {
      // 1. Tenta carregar da chave principal
      const savedData = localStorage.getItem(CURRENT_STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }

      // 2. Migração: Tenta recuperar de chaves antigas (versões anteriores do app)
      const oldKeys = [
        'finanservice_v1_main_data', 
        'finanservice_data_global',
        'finanservice_data_gestor@gmail.com'
      ];

      for (const key of oldKeys) {
        const oldData = localStorage.getItem(key);
        if (oldData) {
          const parsedOld = JSON.parse(oldData);
          if (Array.isArray(parsedOld) && parsedOld.length > 0) {
            console.log(`Dados recuperados da chave antiga: ${key}`);
            return parsedOld;
          }
        }
      }
    } catch (e) {
      console.error("Erro crítico ao acessar armazenamento local:", e);
    }

    // Retorna vazio ou exemplo se realmente não houver nada
    return [];
  });

  // Efeito de persistência automática
  useEffect(() => {
    if (entries.length === 0) {
      // Evita sobrescrever com vazio se acabamos de carregar (segurança extra)
      const existing = localStorage.getItem(CURRENT_STORAGE_KEY);
      if (existing && JSON.parse(existing).length > 0 && entries.length === 0) {
        return; 
      }
    }

    setSaveStatus('saving');
    try {
      localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(entries));
      setTimeout(() => setSaveStatus('saved'), 500);
    } catch (e) {
      console.error("Erro ao salvar:", e);
      setSaveStatus('error');
    }
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => entry.date.startsWith(selectedDate));
  }, [entries, selectedDate]);

  const handleAddEntry = (entry: ServiceEntry) => {
    setEntries(prev => [entry, ...prev]);
    const serviceMonth = entry.date.substring(0, 7);
    if (serviceMonth !== selectedDate) setSelectedDate(serviceMonth);
  };

  const handleUpdateEntry = (updated: ServiceEntry) => {
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm("Deseja realmente excluir este registro permanentemente?")) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const changeMonth = (offset: number) => {
    const [year, month] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1 + offset, 1);
    setSelectedDate(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const formatMonthDisplay = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const tabs = [
    { id: 'dashboard', label: 'Painel', icon: <LayoutDashboard /> },
    { id: 'services', label: 'Serviços', icon: <ReceiptText /> },
    { id: 'ai-consultant', label: 'IA Consultor', icon: <Bot /> },
    { id: 'media-lab', label: 'Mídia & IA', icon: <Camera /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col sticky top-0 h-screen shadow-2xl">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">FinanService <span className="text-emerald-500">AI</span></h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AppTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === tab.id 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'}`}>
                {tab.icon}
              </span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <HardDrive className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Storage</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${saveStatus === 'saved' ? 'bg-emerald-500' : saveStatus === 'saving' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`}></div>
            </div>
            <p className="text-xs font-medium text-slate-300">
              {entries.length} registros seguros
            </p>
          </div>
        </div>
      </aside>

      <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Wallet className="w-6 h-6 text-emerald-500" />
          <h1 className="text-lg font-bold">FinanService AI</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] bg-slate-900 z-30 p-4 space-y-2 animate-in slide-in-from-top duration-300">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as AppTab); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl ${
                activeTab === tab.id ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              {tab.icon}
              <span className="font-medium text-lg">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 capitalize">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={`flex h-2 w-2 rounded-full ${saveStatus === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                <p className="text-slate-500 text-sm">
                  {saveStatus === 'error' ? 'Erro ao salvar!' : 'Sincronizado com o navegador'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-emerald-600">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-4 py-2 flex items-center gap-2 min-w-[180px] justify-center">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-slate-700 capitalize">
                  {formatMonthDisplay(selectedDate)}
                </span>
              </div>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-emerald-600">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </header>

          {filteredEntries.length === 0 && entries.length > 0 && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700">
              <Database className="w-5 h-5" />
              <p className="text-sm font-medium">
                Nenhum serviço em <strong>{formatMonthDisplay(selectedDate)}</strong>. Você possui <strong>{entries.length}</strong> serviços em outros períodos.
              </p>
            </div>
          )}

          {entries.length === 0 && (
            <div className="mb-8 p-10 bg-white border-2 border-dashed border-slate-200 rounded-[32px] text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ReceiptText className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Sua lista está vazia</h3>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto">Comece a organizar suas finanças adicionando seu primeiro serviço prestado na aba "Serviços".</p>
            </div>
          )}

          <div className="transition-all duration-300">
            {activeTab === 'dashboard' && <Dashboard data={filteredEntries} />}
            {activeTab === 'services' && (
              <ServiceManager 
                entries={filteredEntries} 
                onAdd={handleAddEntry} 
                onUpdate={handleUpdateEntry} 
                onDelete={handleDeleteEntry} 
              />
            )}
            {activeTab === 'ai-consultant' && <AIConsultant entries={entries} />}
            {activeTab === 'media-lab' && <MediaLab />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
