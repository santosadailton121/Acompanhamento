
import React, { useState } from 'react';
import { Wallet, LogIn, ShieldCheck, Sparkles } from 'lucide-react';
import { User } from '../types';

interface Props {
  onLogin: (user: User) => void;
}

export const Login: React.FC<Props> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const simulateGoogleLogin = () => {
    setIsLoading(true);
    // Simulação de delay de rede do OAuth
    setTimeout(() => {
      onLogin({
        id: 'google_123',
        name: 'Usuário Convidado',
        email: 'gestor@gmail.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-500/20 mb-6">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">FinanService AI</h1>
          <p className="text-slate-400">Sua gestão financeira de serviços, potencializada por IA.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={simulateGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin"></div>
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                Entrar com Google
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-500 text-center px-4">
            Ao entrar, você concorda com nossos Termos de Uso e Política de Privacidade.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <Sparkles className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Insights IA</h3>
            <p className="text-[10px] text-slate-400 leading-tight mt-1">Análise estratégica de faturamento mensal.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <ShieldCheck className="w-5 h-5 text-blue-400 mb-2" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Seguro</h3>
            <p className="text-[10px] text-slate-400 leading-tight mt-1">Seus dados são salvos de forma privada.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
