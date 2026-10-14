import { useState, FormEvent } from 'react';
import { AlertCircle, CheckCircle, TrendingUp, TrendingDown, HelpCircle, Activity, Plus } from 'lucide-react';
import { IncidentLog, UserProfile } from '../types';

interface DiagnosticsProps {
  profile: UserProfile;
  incidentLogs: IncidentLog[];
  onLogIncident: (incident: Omit<IncidentLog, 'id' | 'timestamp'>) => void;
  onNavigateToAnalytics?: () => void;
}

const WEAKNESS_INFO = {
  procrastination: {
    title: 'Procrastinación Crónica',
    advices: [
      'Usa la regla de los 5 segundos: Cuenta 5-4-3-2-1 e inicia la tarea de inmediato sin darle tiempo a tu cerebro de inventar excusas.',
      'Divide tus entregas grandes en tareas ridículamente pequeñas. Si da pereza, la tarea sigue siendo demasiado grande.',
    ],
  },
  focus: {
    title: 'Falta de Enfoque / Distracciones',
    advices: [
      'Activa el "Foco Radical": pon tu móvil en otra habitación y bloquea las pestañas del navegador que no sean críticas.',
      'Cuando sientas la urgencia de distraerte, detente, respira 3 veces profundamente, y escribe en un papel tu objetivo actual.',
    ],
  },
  punctuality: {
    title: 'Falta de Planificación',
    advices: [
      'Aplica el "Time Blocking" estricto. Si no está en el calendario, no existe.',
      'Planifica tu jornada el día anterior a última hora. Despertar sin un plan claro es una invitación a la deriva.',
    ],
  },
  fatigue: {
    title: 'Fatiga Mental y Burnout',
    advices: [
      'Establece descansos biológicos reales: desconecta 5 minutos por cada 25 de trabajo. Sal del escritorio, estírate y bebe agua.',
      'Define una hora límite de apagado profesional. Trabajar con fatiga produce código/diseño de baja calidad que tendrás que rehacer.',
    ],
  },
};

export default function Diagnostics({ profile, incidentLogs, onLogIncident, onNavigateToAnalytics }: DiagnosticsProps) {
  const [logType, setLogType] = useState<'victory' | 'relapse'>('victory');
  const [description, setDescription] = useState('');

  const currentWeaknessKey = profile.mainWeakness as keyof typeof WEAKNESS_INFO;
  const weaknessInfo = WEAKNESS_INFO[currentWeaknessKey] || WEAKNESS_INFO.procrastination;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    onLogIncident({
      type: logType,
      weakness: profile.mainWeakness,
      description: description.trim(),
      pdpDelta: logType === 'victory' ? 40 : -20,
    });

    setDescription('');
  };

  // Calculations for index graph
  const getDisciplineIndexHistory = () => {
    // Start at 70 index
    const baseIndex = 70;
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const data = days.map((day, idx) => {
      // simulate changes
      let index = baseIndex + (idx * 3);
      // count logs for this index
      if (idx === 6) { // today
        const victories = incidentLogs.filter(l => l.type === 'victory').length;
        const relapses = incidentLogs.filter(l => l.type === 'relapse').length;
        index += (victories * 8) - (relapses * 6);
      } else {
        // mock historical fluctuations based on profile pdp
        index += Math.sin(idx) * 8 + (profile.pdp > 200 ? 10 : -5);
      }
      return {
        day,
        index: Math.min(Math.max(Math.round(index), 20), 100),
      };
    });
    return data;
  };

  const chartData = getDisciplineIndexHistory();

  // SVG dimensions for our custom chart
  const width = 500;
  const height = 180;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Map points to SVG coordinates
  const points = chartData.map((d, i) => {
    const x = padding + (i / (chartData.length - 1)) * chartWidth;
    // index is 0-100, scale to chartHeight (100% at top, 0% at bottom)
    const y = height - padding - (d.index / 100) * chartHeight;
    return { x, y, ...d };
  });

  const polylinePointsString = points.map(p => `${p.x},${p.y}`).join(' ');

  // Gradient area points string (reaches bottom of chart)
  const areaPointsString = `${padding},${height - padding} ` + 
                           polylinePointsString + 
                           ` ${width - padding},${height - padding}`;

  const currentStatusScore = chartData[chartData.length - 1].index;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'text-amber-200 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div id="diagnostics-dashboard" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* LEFT: Diagnostics & Input (6 cols) */}
      <div className="lg:col-span-6 space-y-6">
        {/* Core Weakness Insight */}
        <div className="bg-[#16181d] border border-white/5 rounded-2xl p-6 shadow-xl">
          <span className="text-xs font-mono font-bold bg-white/5 text-amber-200 px-2 py-1 rounded border border-white/10">
            Foco de Autogestión
          </span>
          <h3 className="text-xl font-sans font-bold text-white mt-3 flex items-center gap-2">
            <AlertCircle size={20} className="text-amber-400" /> Diagnóstico: {weaknessInfo.title}
          </h3>
          <p className="text-xs text-white/40 mt-1">
            Estás trabajando activamente en mitigar esta fuga de energía profesional.
          </p>

          <div className="mt-5 space-y-3">
            <h4 className="text-xs font-mono font-bold text-amber-200 uppercase tracking-widest">Estrategias Clínicas de Mitigación:</h4>
            {weaknessInfo.advices.map((advice, idx) => (
              <div key={idx} className="flex gap-3 bg-[#121417]/90 border border-white/10 p-3 rounded-xl">
                <span className="text-amber-400 font-mono font-bold text-xs mt-0.5">0{idx + 1}.</span>
                <p className="text-xs text-white/70 leading-relaxed">{advice}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Incident Logger Form */}
        <div className="bg-[#16181d] border border-white/5 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-sans font-bold text-white mb-4 flex items-center gap-2">
            <Activity size={18} className="text-amber-400" /> Registro Diario de Conducta
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Toggle Victory / Relapse */}
            <div className="grid grid-cols-2 gap-3 p-1 bg-[#121417] border border-white/10 rounded-xl" id="log-type-selector">
              <button
                id="log-victory-btn"
                type="button"
                onClick={() => setLogType('victory')}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  logType === 'victory'
                    ? 'bg-white/5 text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                <CheckCircle size={14} className={logType === 'victory' ? 'text-emerald-400' : 'text-white/30'} />
                Victoria (+40 PDP)
              </button>
              
              <button
                id="log-relapse-btn"
                type="button"
                onClick={() => setLogType('relapse')}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  logType === 'relapse'
                    ? 'bg-white/5 text-rose-400 border border-rose-500/20 shadow-sm'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                <AlertCircle size={14} className={logType === 'relapse' ? 'text-rose-400' : 'text-white/30'} />
                Relapso (-20 PDP)
              </button>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-medium text-white/50 uppercase tracking-widest" htmlFor="log-desc-input">
                {logType === 'victory' 
                  ? '¿Cómo lograste vencer la tentación o avanzar?' 
                  : '¿Qué interrupción o distracción ocurrió? Sé brutalmente honesto:'}
              </label>
              <textarea
                id="log-desc-input"
                className="w-full text-xs bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[80px]"
                placeholder={logType === 'victory'
                  ? 'Ej. Sentí la urgencia de procrastinar en Instagram, pero apliqué la regla de los 5 segundos y completé un Pomodoro.'
                  : 'Ej. Me distraje viendo videos irrelevantes de tecnología durante 30 minutos mientras debía escribir el reporte.'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <button
              id="log-submit-btn"
              type="submit"
              className="w-full bg-amber-500 text-[#0d0e10] py-2.5 rounded-lg text-xs font-bold hover:bg-amber-400 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-lg shadow-amber-500/5"
            >
              <Plus size={14} /> Registrar en mi Historial de Disciplina
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT: SVG Chart & Log History (6 cols) */}
      <div className="lg:col-span-6 space-y-6">
        {/* SVG Metrics Chart */}
        <div className="bg-[#16181d] border border-white/5 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-sans font-bold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-amber-400" /> Índice de Disciplina (7D)
              </h3>
              <p className="text-xs text-white/40 mt-0.5">Indicador dinámico ponderado de enfoque profesional.</p>
            </div>
            <div className={`border rounded-lg px-2.5 py-1 text-center font-mono ${getScoreColor(currentStatusScore)}`}>
              <span className="text-lg font-bold block">{currentStatusScore}%</span>
              <span className="text-[9px] uppercase font-bold">Estado</span>
            </div>
          </div>

          {/* SVG Canvas Area */}
          <div className="w-full h-44 overflow-hidden rounded-xl border border-white/10 bg-[#121417] p-2 flex items-center justify-center">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full max-h-[160px]">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[20, 50, 80].map((yVal, index) => {
                const scaledY = height - padding - (yVal / 100) * chartHeight;
                return (
                  <g key={index}>
                    <line
                      x1={padding}
                      y1={scaledY}
                      x2={width - padding}
                      y2={scaledY}
                      className="stroke-white/10"
                      strokeWidth="0.75"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding - 8}
                      y={scaledY + 3}
                      className="fill-white/30 font-mono text-[9px]"
                      textAnchor="end"
                    >
                      {yVal}%
                    </text>
                  </g>
                );
              })}

              {/* Gradient Shaded Area */}
              <polygon points={areaPointsString} fill="url(#chart-grad)" />

              {/* Path Line */}
              <polyline
                points={polylinePointsString}
                fill="none"
                className="stroke-amber-400"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    className="fill-[#16181d] stroke-amber-400"
                    strokeWidth="2.5"
                  />
                  <text
                    x={p.x}
                    y={height - padding + 14}
                    className="fill-white/40 font-mono text-[9px]"
                    textAnchor="middle"
                  >
                    {p.day}
                  </text>
                  <text
                    x={p.x}
                    y={p.y - 8}
                    className="fill-white/80 font-mono text-[8px] font-bold"
                    textAnchor="middle"
                  >
                    {p.index}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          
          <p className="text-[10px] text-white/30 text-center mt-3">
            El índice sube con victorias consecutivas de disciplina (+8%) y cae con relapsos (-6%).
          </p>

          {onNavigateToAnalytics && (
            <div className="mt-4 pt-3 border-t border-white/5 flex justify-center">
              <button
                type="button"
                onClick={onNavigateToAnalytics}
                className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/20 transition-all"
              >
                <TrendingUp size={13} />
                Ver Análisis PDP de 14 Días (Recharts) →
              </button>
            </div>
          )}
        </div>

        {/* Logs Timeline */}
        <div className="bg-[#16181d] border border-white/5 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-mono font-bold text-white mb-4 uppercase tracking-widest">Historial Reciente</h3>
          <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1" id="diagnostic-history">
            {incidentLogs.length === 0 ? (
              <p className="text-xs text-white/30 italic text-center py-6">No has registrado conductas hoy todavía.</p>
            ) : (
              incidentLogs.slice().reverse().map((log) => {
                const isVictory = log.type === 'victory';
                return (
                  <div
                    key={log.id}
                    className={`p-3 rounded-lg border flex justify-between items-start text-xs ${
                      isVictory
                        ? 'border-emerald-500/15 bg-emerald-500/[0.04]'
                        : 'border-rose-500/15 bg-rose-500/[0.04]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isVictory ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        <span className={`font-semibold uppercase text-[10px] ${isVictory ? 'text-emerald-300' : 'text-rose-300'}`}>
                          {isVictory ? 'Victoria' : 'Relapso'}
                        </span>
                        <span className="text-white/30 font-mono text-[9px]">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-white/70 text-xs leading-snug">{log.description}</p>
                    </div>

                    <span className={`font-mono font-bold whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] ${
                      isVictory ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
                    }`}>
                      {isVictory ? `+${log.pdpDelta}` : `${log.pdpDelta}`} PDP
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
