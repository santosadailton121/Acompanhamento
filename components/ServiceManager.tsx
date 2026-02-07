
import React, { useState } from 'react';
import { ServiceEntry } from '../types';
import { Plus, Search, Edit2, Trash2, X, Check } from 'lucide-react';

interface Props {
  entries: ServiceEntry[];
  onAdd: (entry: ServiceEntry) => void;
  onUpdate: (entry: ServiceEntry) => void;
  onDelete: (id: string) => void;
}

export const ServiceManager: React.FC<Props> = ({ entries, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ServiceEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Omit<ServiceEntry, 'id'>>({
    clientName: '',
    serviceType: '',
    paymentMethod: 'Pix',
    value: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'Geral'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEntry) {
      onUpdate({ ...formData, id: editingEntry.id });
    } else {
      onAdd({ ...formData, id: Math.random().toString(36).substr(2, 9) });
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      serviceType: '',
      paymentMethod: 'Pix',
      value: 0,
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: 'Geral'
    });
    setEditingEntry(null);
    setIsModalOpen(false);
  };

  const startEdit = (entry: ServiceEntry) => {
    setEditingEntry(entry);
    setFormData({ ...entry });
    setIsModalOpen(true);
  };

  const filteredEntries = entries.filter(e => 
    e.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou serviço..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" /> Novo Serviço
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Data</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Serviço</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Pagamento</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Valor</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(entry.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{entry.clientName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{entry.serviceType}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">
                      {entry.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">R$ {entry.value.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => startEdit(entry)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(entry.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    Nenhum serviço encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">{editingEntry ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}</h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Nome do Cliente</label>
                  <input required className="w-full px-4 py-2 border rounded-lg" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Tipo de Serviço</label>
                  <input required className="w-full px-4 py-2 border rounded-lg" value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Forma de Pagamento</label>
                  <select className="w-full px-4 py-2 border rounded-lg bg-white" value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                    <option>Pix</option>
                    <option>Cartão de Crédito</option>
                    <option>Boleto</option>
                    <option>Dinheiro</option>
                    <option>Transferência</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Valor (R$)</label>
                  <input type="number" step="0.01" required className="w-full px-4 py-2 border rounded-lg" value={formData.value} onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Data do Serviço</label>
                  <input type="date" required className="w-full px-4 py-2 border rounded-lg" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Categoria</label>
                  <input className="w-full px-4 py-2 border rounded-lg" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Descrição Detalhada</label>
                <textarea rows={3} className="w-full px-4 py-2 border rounded-lg" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={resetForm} className="px-6 py-2 border rounded-lg hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-md flex items-center gap-2">
                  <Check className="w-5 h-5" /> {editingEntry ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
