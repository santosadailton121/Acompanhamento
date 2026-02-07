
import React, { useState } from 'react';
import { generateMarketingImage, analyzeReceipt } from '../services/geminiService';
// Fix: Added Sparkles import and removed unused AspectRatio
import { ImageIcon, Wand2, Upload, Search, Loader2, Download, Sparkles } from 'lucide-react';

export const MediaLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  
  const [receiptAnalysis, setReceiptAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // MANDATORY: When using gemini-3-pro-image-preview, users must select their own API key.
    // Fix: Use the globally available aistudio object. 
    // The manual declaration was removed to avoid conflict with the environment's predefined AIStudio type.
    try {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
        // Proceed after opening dialog; do not add delay as per guidelines.
      }
    } catch (e) {
      console.warn("API key selection check failed", e);
    }

    setGenerating(true);
    try {
      const url = await generateMarketingImage(prompt, aspectRatio);
      setGeneratedImg(url);
    } catch (e: any) {
      // Handle "Requested entity was not found" error by prompting for key selection again.
      if (e.message?.includes("Requested entity was not found")) {
        await (window as any).aistudio.openSelectKey();
      }
      alert("Erro ao gerar imagem de marketing. Verifique sua chave de API.");
    } finally {
      setGenerating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const analysis = await analyzeReceipt(base64, file.type);
        setReceiptAnalysis(analysis);
      } catch (err) {
        alert("Erro ao analisar imagem.");
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Wand2 className="text-purple-600 w-6 h-6" />
          <h2 className="text-xl font-bold text-slate-800">Criação de Marketing</h2>
        </div>
        <p className="text-sm text-slate-500">Gere imagens profissionais para divulgar seus serviços.</p>
        
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase">Descrição do Marketing</label>
          <textarea 
            rows={3}
            placeholder="Ex: Uma imagem moderna de um designer trabalhando num escritório minimalista para banner de Instagram..."
            className="w-full p-4 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-purple-500/20"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase">Proporção (Aspect Ratio)</label>
          <div className="grid grid-cols-4 gap-2">
            {['1:1', '4:3', '16:9', '9:16'].map(ratio => (
              <button 
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  aspectRatio === ratio ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-500 border-slate-200'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={generating || !prompt}
          className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-md"
        >
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
          Gerar Imagem com Gemini Pro
        </button>
        <p className="text-[10px] text-center text-slate-400">
          Usa gemini-3-pro-image-preview. Requer chave com faturamento ativo. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline font-medium">Faturamento</a>
        </p>

        {generatedImg && (
          <div className="mt-4 animate-in fade-in zoom-in">
            <img src={generatedImg} alt="Generated" className="w-full rounded-xl shadow-lg border border-slate-200" />
            <a 
              href={generatedImg} 
              download="marketing.png"
              className="mt-4 flex items-center justify-center gap-2 text-purple-600 font-bold hover:underline"
            >
              <Download className="w-4 h-4" /> Baixar Imagem
            </a>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Search className="text-emerald-600 w-6 h-6" />
          <h2 className="text-xl font-bold text-slate-800">Analisador de Recibos</h2>
        </div>
        <p className="text-sm text-slate-500">Suba fotos de faturas ou recibos para extração automática de dados.</p>

        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-emerald-50 transition-colors cursor-pointer group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className={`w-10 h-10 mb-3 ${analyzing ? 'animate-bounce text-emerald-500' : 'text-slate-400 group-hover:text-emerald-500'}`} />
            <p className="mb-2 text-sm text-slate-500 font-medium">
              {analyzing ? 'Analisando documento...' : 'Clique ou arraste um recibo'}
            </p>
            <p className="text-xs text-slate-400">PNG ou JPG</p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={analyzing} />
        </label>

        {receiptAnalysis && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 animate-in slide-in-from-bottom-2">
            <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Extração de Dados
            </h3>
            <div className="text-sm text-emerald-900 whitespace-pre-wrap">
              {receiptAnalysis}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
