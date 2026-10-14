import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';
import { safeStorage } from '../utils/safeStorage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetSafeState = () => {
    try {
      safeStorage.removeItem('tempos_profile');
      safeStorage.removeItem('tempos_blocks');
      safeStorage.removeItem('tempos_incidents');
      safeStorage.removeItem('tempos_badges');
      safeStorage.removeItem('tempos_journal');
      safeStorage.removeItem('tempos_crushed_count');
      safeStorage.removeItem('tempos_justin_vision');
    } catch {
      // Ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d0e10] text-[#f2f4f7] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#16181d] border border-amber-500/30 rounded-2xl p-6 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl mx-auto flex items-center justify-center text-amber-400">
              <AlertTriangle size={28} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Recuperación de Estado
              </h2>
              <p className="text-xs text-white/60 leading-relaxed">
                La aplicación detectó una discrepancia en el entorno de ejecución o navegador compartido. Puedes recargar o restaurar el estado inicial optimizado para Justin.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-left">
                <span className="text-[10px] font-mono text-amber-400/80 block uppercase tracking-wider mb-1">Diagnóstico interno:</span>
                <p className="text-[11px] font-mono text-white/50 break-words line-clamp-3">
                  {this.state.error.message || 'Error de entorno desconocido'}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-[#0d0e10] font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <RefreshCw size={14} /> Recargar Página
              </button>
              <button
                type="button"
                onClick={this.handleResetSafeState}
                className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-medium text-xs rounded-xl border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RotateCcw size={14} /> Restaurar Estado Limpio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
