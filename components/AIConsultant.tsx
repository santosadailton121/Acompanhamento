
import React, { useState, useRef, useEffect } from 'react';
import { chatWithGemini, analyzeFinances } from '../services/geminiService';
import { ServiceEntry, ChatMessage } from '../types';
import { Send, Bot, Sparkles, Loader2, BarChart3 } from 'lucide-react';

interface Props {
  entries: ServiceEntry[];
}

export const AIConsultant: React.FC<Props> = ({ entries }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Olá! Sou seu consultor financeiro IA. Posso analisar seus serviços ou tirar dúvidas sobre gestão. Como posso ajudar hoje?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithGemini(input, messages.map(m => ({ role: m.role, text: m.text })));
      setMessages(prev => [...prev, { role: 'model', text: response || "Erro na resposta.", timestamp: Date.now() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Desculpe, tive um problema ao processar sua pergunta.", timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFullAnalysis = async () => {
    if (entries.length === 0) {
      alert("Adicione alguns serviços primeiro para eu poder analisar.");
      return;
    }
    setAnalyzing(true);
    try {
      const analysis = await analyzeFinances(entries);
      setMessages(prev => [...prev, { role: 'model', text: analysis, timestamp: Date.now() }]);
    } catch (e) {
      alert("Falha na análise estratégica.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 bg-emerald-600 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-full">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold">Consultor Financeiro AI</h2>
            <p className="text-xs text-emerald-100">Inteligência Estratégica</p>
          </div>
        </div>
        <button 
          onClick={handleFullAnalysis} 
          disabled={analyzing}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors border border-white/20"
        >
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
          Análise Completa
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
              m.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
            }`}>
              <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
                {m.text.split('\n').map((line, idx) => <p key={idx}>{line}</p>)}
              </div>
              <p className={`text-[10px] mt-2 text-right ${m.role === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span className="text-sm text-slate-500">IA está pensando...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="relative flex items-center">
          <input 
            type="text" 
            placeholder="Pergunte algo sobre seu faturamento, impostos ou estratégias..." 
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          Powered by Gemini 3 Pro • Thinking mode ativado
        </p>
      </div>
    </div>
  );
};
