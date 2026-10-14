import { Award, Zap, Shield, TrendingUp, Compass, Flame, Info, ArrowRight } from 'lucide-react';
import { UserProfile, Badge } from '../types';

interface GamificationProps {
  profile: UserProfile;
  badges: Badge[];
  onNavigateToAnalytics?: () => void;
}

const LEVEL_NAMES = [
  'Iniciado Autocrítico',
  'Pragmático Enfocado',
  'Arquitecto de Rutinas',
  'Muralla Anti-Distracciones',
  'Cronógrafo Humano',
];

export default function Gamification({ profile, badges, onNavigateToAnalytics }: GamificationProps) {
  const currentLevelName = LEVEL_NAMES[Math.min(profile.level - 1, LEVEL_NAMES.length - 1)];
  
  // Level progression math
  const getLevelProgress = () => {
    const pointsForCurrentLevel = (profile.level - 1) * 300;
    const pointsForNextLevel = profile.level * 300;
    const levelRange = pointsForNextLevel - pointsForCurrentLevel;
    const progressInCurrentLevel = profile.pdp - pointsForCurrentLevel;
    const percentage = (progressInCurrentLevel / levelRange) * 100;
    return {
      percentage: Math.min(Math.max(percentage, 0), 100),
      current: progressInCurrentLevel,
      required: levelRange,
      nextPoints: pointsForNextLevel,
    };
  };

  const progress = getLevelProgress();

  return (
    <div id="gamification-dashboard" className="space-y-6 animate-fade-in">
      
      {/* Top Banner: Level Progress */}
      <div className="bg-[#16181d] border border-white/5 rounded-2xl p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <div className="md:col-span-4 space-y-2">
            <span className="text-[10px] font-mono font-bold bg-white/5 text-amber-200 border border-white/10 px-2.5 py-1 rounded">
              Nivel de Madurez {profile.level}
            </span>
            <h3 className="text-2xl font-sans font-extrabold text-white tracking-tight">
              {currentLevelName}
            </h3>
            <p className="text-xs text-white/40">
              Has acumulado un total de <span className="font-mono font-bold text-amber-400">{profile.pdp} PDP</span> de autodisciplina.
            </p>
          </div>

          <div className="md:col-span-8 space-y-3">
            <div className="flex justify-between text-xs font-mono font-semibold text-white/70">
              <span>Progreso de Nivel</span>
              <span>{Math.round(progress.percentage)}% ({profile.pdp} / {progress.nextPoints} PDP)</span>
            </div>
            
            {/* Custom progress bar */}
            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/10">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500 shadow-md shadow-amber-500/50"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-white/30">
              <span className="flex items-center gap-1">
                <Info size={11} className="text-amber-400" /> Gana puntos completando Pomodoros (+50), agendas (+10) o venciendo tentaciones (+40).
              </span>
              <span>Siguiente Rango: {LEVEL_NAMES[Math.min(profile.level, LEVEL_NAMES.length - 1)]}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Racha (Streaks) & Metrics overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Racha Card */}
        <div className="bg-[#16181d] border border-white/5 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <Flame size={24} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-white/30 font-mono uppercase tracking-wide">Racha de Foco</span>
            <h4 className="text-xl font-sans font-bold text-white mt-0.5">{profile.streak} Días Activos</h4>
            <p className="text-[10px] text-white/40">¡Registra un bloque o conducta diaria para no perder tu racha!</p>
          </div>
        </div>

        {/* Resistencia Card */}
        <div className="bg-[#16181d] border border-white/5 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Shield size={24} />
          </div>
          <div>
            <span className="text-[10px] text-white/30 font-mono uppercase tracking-wide">Poder de Resistencia</span>
            <h4 className="text-xl font-sans font-bold text-white mt-0.5">Alto Rendimiento</h4>
            <p className="text-[10px] text-white/40">Excelente relación entre victorias y relapsos de atención.</p>
          </div>
        </div>

        {/* Badge unlock counts */}
        <div className="bg-[#16181d] border border-white/5 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Award size={24} />
          </div>
          <div>
            <span className="text-[10px] text-white/30 font-mono uppercase tracking-wide">Insignias Obtenidas</span>
            <h4 className="text-xl font-sans font-bold text-white mt-0.5">
              {badges.filter(b => b.unlocked).length} de {badges.length} desbloqueadas
            </h4>
            <p className="text-[10px] text-white/40">Logros profesionales que certifican tu autodisciplina.</p>
          </div>
        </div>

      </div>

      {/* Banner de acceso a la Tendencia de 14 Días con Recharts */}
      {onNavigateToAnalytics && (
        <div className="bg-gradient-to-r from-[#1b1d24] via-[#16181f] to-[#12141a] border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <TrendingUp size={24} className="text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded uppercase">
                  Recharts Interactivo
                </span>
                <span className="text-xs text-white/40 font-mono">14 Días Evaluados</span>
              </div>
              <h4 className="text-base font-sans font-bold text-white mt-1">
                Visualización de Tendencia y Balance PDP
              </h4>
              <p className="text-xs text-white/50">
                Observa cómo se dividen tus {profile.pdp} puntos entre Productividad, Disciplina y Propósito con gráficos de área, barras apiladas y radar.
              </p>
            </div>
          </div>

          <button
            id="view-analytics-from-gamification"
            type="button"
            onClick={onNavigateToAnalytics}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-[#0d0e10] text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap self-start sm:self-center"
          >
            Ver Gráficos PDP (14 Días)
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Badges Grid */}
      <div className="bg-[#16181d] border border-white/5 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-sans font-bold text-white mb-6 flex items-center gap-2">
          <Award size={20} className="text-amber-400" /> Insignias de Disciplina Profesional
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="badges-grid">
          {badges.map((badge) => {
            return (
              <div
                key={badge.id}
                id={`badge-card-${badge.id}`}
                className={`p-4 border rounded-xl flex gap-4 transition-all ${
                  badge.unlocked
                    ? 'border-white/10 bg-[#121417]/90 shadow-lg'
                    : 'border-white/5 bg-[#121417]/30 opacity-40'
                }`}
              >
                <div className={`p-3 rounded-lg border flex items-center justify-center shrink-0 self-start ${
                  badge.unlocked
                    ? 'bg-amber-500 text-[#0d0e10] border-amber-500'
                    : 'bg-white/5 text-white/20 border-white/10'
                }`}>
                  <Award size={22} className={badge.unlocked ? 'animate-pulse' : ''} />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-xs font-bold leading-none ${badge.unlocked ? 'text-white' : 'text-white/40'}`}>
                      {badge.title}
                    </h4>
                    {badge.unlocked ? (
                      <span className="text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded uppercase">
                        Activa
                      </span>
                    ) : (
                      <span className="text-[8px] font-mono font-bold bg-white/5 text-white/30 px-1.5 py-0.5 rounded">
                        Bloqueada
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/50 leading-normal">{badge.description}</p>
                  <span className="text-[10px] font-mono text-amber-400/60 block pt-1">
                    Req: {badge.pointsRequired} PDP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
