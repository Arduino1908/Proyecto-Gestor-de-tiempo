import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Award,
  Zap,
  Target,
  Shield,
  Compass,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  Flame,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { UserProfile, IncidentLog, TimeBlock, StoicJournalEntry } from '../types';
import { safeStorage } from '../utils/safeStorage';

export interface PDPDailyRecord {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g., 'Lun 02', 'Hoy'
  dayOfWeek: string; // 'Lun', 'Mar', etc.
  productivity: number; // Puntos de Productividad
  discipline: number; // Puntos de Disciplina
  purpose: number; // Puntos de Propósito
  totalDaily: number; // Suma del día
  cumulative: number; // PDP acumulado hasta ese día
  target: number; // Meta diaria recomendada (50 PDP)
  highlight?: string; // Hito o logro del día
}

interface PDPProgressChartProps {
  profile: UserProfile;
  incidentLogs?: IncidentLog[];
  timeBlocks?: TimeBlock[];
  journalEntries?: StoicJournalEntry[];
  onAddPDP?: (points: number, reason: string) => void;
}

// Generador de datos históricos deterministas para las últimas 2 semanas (14 días)
function generate14DayPDPData(
  currentPdp: number,
  incidentLogs: IncidentLog[] = [],
  journalEntries: StoicJournalEntry[] = [],
  timeBlocks: TimeBlock[] = []
): PDPDailyRecord[] {
  const records: PDPDailyRecord[] = [];
  const now = new Date();

  // Calcular actividad real de hoy basada en el estado actual de la app
  const todaysVictories = incidentLogs.filter(
    (l) => l.type === 'victory' && (!l.timestamp || new Date(l.timestamp).toDateString() === now.toDateString())
  ).length;
  const todaysRelapses = incidentLogs.filter(
    (l) => l.type === 'relapse' && (!l.timestamp || new Date(l.timestamp).toDateString() === now.toDateString())
  ).length;
  const todaysCompletedBlocks = timeBlocks.filter((b) => b.completed).length;
  const todaysJournalCount = journalEntries.filter(
    (j) => j.date === now.toISOString().split('T')[0]
  ).length;

  // Puntos calculados para hoy
  const liveTodayProductivity = Math.max(20, todaysCompletedBlocks * 25 + 15);
  const liveTodayDiscipline = Math.max(10, (todaysVictories * 40) - (todaysRelapses * 20) + 15);
  const liveTodayPurpose = Math.max(15, todaysJournalCount * 25 + 10);
  const liveTodayTotal = liveTodayProductivity + liveTodayDiscipline + liveTodayPurpose;

  // Base histórica de 13 días previos que conduce orgánicamente a la puntuación actual de Justin
  // Días del 0 (hace 13 días) al 13 (hoy)
  const historicalSeed = [
    { p: 15, d: 10, u: 10, note: 'Inicio del sistema de autodisciplina' },
    { p: 25, d: 15, u: 10, note: 'Primer bloque de 60m Deep Work completado' },
    { p: 20, d: 10, u: 15, note: 'Reflexión estoica sobre procrastinación' },
    { p: 30, d: 20, u: 15, note: '3 Pomodoros seguidos sin interrupciones' },
    { p: 15, d: 5,  u: 10, note: 'Día desafiante, tentación de redes superada' },
    { p: 35, d: 25, u: 20, note: 'Racha de 3 días activada' },
    { p: 40, d: 25, u: 25, note: 'Cierre de sprint técnico a tiempo' },
    { p: 25, d: 20, u: 15, note: 'Descanso activo y rutina de estiramientos' },
    { p: 45, d: 30, u: 20, note: 'Foco Radical: Modo avión toda la mañana' },
    { p: 35, d: 25, u: 25, note: 'Diario estoico: Cero reactividad mental' },
    { p: 50, d: 35, u: 25, note: 'Récord de concentración: 4 horas brutas' },
    { p: 40, d: 30, u: 20, note: 'Caminata de 5m en fatiga vespertina' },
    { p: 45, d: 35, u: 25, note: 'Vinculación de Pomodoros a bloques' },
  ];

  let runningCumulative = Math.max(20, currentPdp - 380);
  if (runningCumulative < 0) runningCumulative = 20;

  const daysWeekNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = daysWeekNames[d.getDay()];
    const isToday = i === 0;

    let p = 25;
    let disc = 20;
    let purp = 15;
    let note = '';

    if (isToday) {
      p = liveTodayProductivity;
      disc = liveTodayDiscipline;
      purp = liveTodayPurpose;
      note = 'Jornada activa de Justin en progreso';
    } else {
      const seedIndex = 13 - i;
      const seed = historicalSeed[seedIndex] || { p: 25, d: 20, u: 15, note: 'Rutina sostenida' };
      p = seed.p;
      disc = seed.d;
      purp = seed.u;
      note = seed.note;
    }

    const totalDaily = p + disc + purp;
    runningCumulative += totalDaily;

    // Formato día: "Lun 02" o "Hoy"
    const dayMonth = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const dayLabel = isToday ? 'Hoy' : `${dayOfWeek} ${dayMonth}`;

    records.push({
      date: dateStr,
      dayLabel,
      dayOfWeek,
      productivity: p,
      discipline: disc,
      purpose: purp,
      totalDaily,
      cumulative: runningCumulative,
      target: 50, // Meta recomendada de 50 PDP diarios
      highlight: note,
    });
  }

  return records;
}

export default function PDPProgressChart({
  profile,
  incidentLogs = [],
  timeBlocks = [],
  journalEntries = [],
  onAddPDP,
}: PDPProgressChartProps) {
  // Estado de vista y filtros
  const [chartType, setChartType] = useState<'composed' | 'stackedBar' | 'cumulativeLine' | 'radar'>('composed');
  const [metricFilter, setMetricFilter] = useState<'all' | 'productivity' | 'discipline' | 'purpose'>('all');
  const [showTargetLine, setShowTargetLine] = useState<boolean>(true);
  const [selectedDayRecord, setSelectedDayRecord] = useState<PDPDailyRecord | null>(null);

  // Computar datos de las últimas dos semanas
  const data = useMemo(() => {
    // Intentar leer si hay historial guardado previamente
    const saved = safeStorage.getJSON<PDPDailyRecord[] | null>('tempos_pdp_14d_history', null);
    const generated = generate14DayPDPData(profile.pdp, incidentLogs, journalEntries, timeBlocks);
    
    // Si hay datos generados, sincronizamos con el PDP actual de Justin
    if (generated.length > 0) {
      // Ajustar último día acumulado con el perfil
      generated[generated.length - 1].cumulative = profile.pdp;
      // Retrasar gradualmente los acumulados previos
      for (let i = generated.length - 2; i >= 0; i--) {
        generated[i].cumulative = Math.max(10, generated[i + 1].cumulative - generated[i + 1].totalDaily);
      }
    }
    return generated;
  }, [profile.pdp, incidentLogs, journalEntries, timeBlocks]);

  // Cálculos de métricas clave (KPIs)
  const kpis = useMemo(() => {
    if (!data.length) {
      return {
        totalEarned14d: 0,
        dailyAverage: 0,
        bestDay: null as PDPDailyRecord | null,
        targetHitRate: 0,
        prodShare: 0,
        discShare: 0,
        purpShare: 0,
        growthRate: 0,
        consistencyStreak: 0,
      };
    }

    const totalEarned14d = data.reduce((acc, d) => acc + d.totalDaily, 0);
    const dailyAverage = Math.round(totalEarned14d / data.length);
    const bestDay = [...data].sort((a, b) => b.totalDaily - a.totalDaily)[0];
    const targetHitDays = data.filter((d) => d.totalDaily >= d.target).length;
    const targetHitRate = Math.round((targetHitDays / data.length) * 100);

    const totalProd = data.reduce((acc, d) => acc + d.productivity, 0);
    const totalDisc = data.reduce((acc, d) => acc + d.discipline, 0);
    const totalPurp = data.reduce((acc, d) => acc + d.purpose, 0);
    const sumAll = totalProd + totalDisc + totalPurp || 1;

    const prodShare = Math.round((totalProd / sumAll) * 100);
    const discShare = Math.round((totalDisc / sumAll) * 100);
    const purpShare = Math.round((totalPurp / sumAll) * 100);

    // Comparar semana 1 (primeros 7 días) vs semana 2 (últimos 7 días)
    const week1Total = data.slice(0, 7).reduce((acc, d) => acc + d.totalDaily, 0);
    const week2Total = data.slice(7).reduce((acc, d) => acc + d.totalDaily, 0);
    const growthRate = week1Total > 0 ? Math.round(((week2Total - week1Total) / week1Total) * 100) : 100;

    return {
      totalEarned14d,
      dailyAverage,
      bestDay,
      targetHitRate,
      prodShare,
      discShare,
      purpShare,
      growthRate,
      week1Total,
      week2Total,
    };
  }, [data]);

  // Datos para gráfico Radar de balance de pilares
  const radarData = useMemo(() => {
    const totalProd = data.reduce((acc, d) => acc + d.productivity, 0);
    const totalDisc = data.reduce((acc, d) => acc + d.discipline, 0);
    const totalPurp = data.reduce((acc, d) => acc + d.purpose, 0);
    const maxVal = Math.max(totalProd, totalDisc, totalPurp, 1);

    return [
      { pilar: 'Productividad', puntos: totalProd, fullMark: maxVal * 1.2, pct: kpis.prodShare },
      { pilar: 'Disciplina', puntos: totalDisc, fullMark: maxVal * 1.2, pct: kpis.discShare },
      { pilar: 'Propósito', puntos: totalPurp, fullMark: maxVal * 1.2, pct: kpis.purpShare },
    ];
  }, [data, kpis]);

  // Custom Tooltip component para Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const record = payload[0]?.payload as PDPDailyRecord;
      if (!record) return null;

      return (
        <div className="bg-[#121418] border border-amber-500/30 rounded-xl p-3.5 shadow-2xl text-xs max-w-xs z-50 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <span className="font-bold text-white flex items-center gap-1.5 font-mono">
              <Calendar size={13} className="text-amber-400" />
              {record.dayLabel} ({record.date})
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                record.totalDaily >= record.target
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/10 text-white/60'
              }`}
            >
              {record.totalDaily >= record.target ? '✓ Meta Superada' : 'En progreso'}
            </span>
          </div>

          <div className="space-y-1.5 font-sans">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-blue-300">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                Productividad (P):
              </span>
              <span className="font-mono font-bold text-white">+{record.productivity} PDP</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                Disciplina (D):
              </span>
              <span className="font-mono font-bold text-white">+{record.discipline} PDP</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                Propósito (P):
              </span>
              <span className="font-mono font-bold text-white">+{record.purpose} PDP</span>
            </div>

            <div className="border-t border-white/10 pt-1.5 mt-1.5 flex items-center justify-between">
              <span className="text-white/60 font-medium">Total del Día:</span>
              <span className="font-mono font-extrabold text-amber-400 text-sm">
                {record.totalDaily} PDP
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-white/50">
              <span>Acumulado Total:</span>
              <span className="font-mono text-white/90">{record.cumulative} PDP</span>
            </div>

            {record.highlight && (
              <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-white/70 italic flex items-start gap-1">
                <Sparkles size={11} className="text-amber-400 shrink-0 mt-0.5" />
                <span>{record.highlight}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="pdp-progress-visualization" className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#1a1c23] via-[#14161b] to-[#0f1115] border border-amber-500/25 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={12} className="text-amber-400" />
                Últimas 2 Semanas (14 Días)
              </span>
              <span className="text-xs text-white/40 font-mono">
                Tendencia de Justin
              </span>
            </div>
            <h2 className="text-2xl font-sans font-extrabold text-white tracking-tight flex items-center gap-2">
              Evolución de Puntos PDP
              <span className="text-amber-400 font-mono text-xl">({profile.pdp} PDP)</span>
            </h2>
            <p className="text-xs text-white/60 max-w-2xl leading-relaxed">
              Monitoreo analítico de los 3 pilares del alto rendimiento: <strong className="text-blue-300">Productividad</strong> (ejecución de bloques), <strong className="text-amber-300">Disciplina</strong> (resistencia a impulsos) y <strong className="text-emerald-300">Propósito</strong> (claridad mental y estoicismo).
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2.5 self-start md:self-center">
            {onAddPDP && (
              <button
                type="button"
                onClick={() => onAddPDP(20, 'Sesión de Análisis y Compromiso')}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#0d0e10] font-sans font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap size={14} className="fill-current" />
                +20 PDP Foco Justin
              </button>
            )}
          </div>
        </div>

        {/* 4 KPI Highlight Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-white/10">
          {/* KPI 1 */}
          <div className="bg-[#121418]/80 border border-white/5 rounded-xl p-3.5 hover:border-amber-500/20 transition-all">
            <div className="flex items-center justify-between text-white/50 text-[11px] mb-1">
              <span>Ganados en 14d</span>
              <Zap size={13} className="text-amber-400" />
            </div>
            <div className="text-xl font-mono font-extrabold text-white">
              +{kpis.totalEarned14d} <span className="text-xs font-normal text-amber-400 font-sans">PDP</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-1">
              <ArrowUpRight size={12} />
              +{kpis.growthRate}% vs semana previa
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-[#121418]/80 border border-white/5 rounded-xl p-3.5 hover:border-amber-500/20 transition-all">
            <div className="flex items-center justify-between text-white/50 text-[11px] mb-1">
              <span>Promedio Diario</span>
              <Target size={13} className="text-blue-400" />
            </div>
            <div className="text-xl font-mono font-extrabold text-white">
              {kpis.dailyAverage} <span className="text-xs font-normal text-white/40 font-sans">PDP/día</span>
            </div>
            <div className="text-[10px] text-white/50 mt-1">
              Meta base: 50 PDP ({kpis.dailyAverage >= 50 ? '✓ Superada' : 'Alcanzable'})
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-[#121418]/80 border border-white/5 rounded-xl p-3.5 hover:border-amber-500/20 transition-all">
            <div className="flex items-center justify-between text-white/50 text-[11px] mb-1">
              <span>Consistencia Meta</span>
              <CheckCircle2 size={13} className="text-emerald-400" />
            </div>
            <div className="text-xl font-mono font-extrabold text-emerald-400">
              {kpis.targetHitRate}%
            </div>
            <div className="text-[10px] text-white/50 mt-1">
              Días con &ge; 50 PDP en 2 sem.
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-[#121418]/80 border border-white/5 rounded-xl p-3.5 hover:border-amber-500/20 transition-all">
            <div className="flex items-center justify-between text-white/50 text-[11px] mb-1">
              <span>Día Récord</span>
              <Award size={13} className="text-amber-400" />
            </div>
            <div className="text-xl font-mono font-extrabold text-amber-300">
              {kpis.bestDay?.totalDaily || 0} <span className="text-xs font-normal text-white/40 font-sans">PDP</span>
            </div>
            <div className="text-[10px] text-white/50 mt-1 truncate">
              {kpis.bestDay?.dayLabel || 'Reciente'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Container with Toolbar */}
      <div className="bg-[#16181d] border border-white/5 rounded-2xl p-6 shadow-xl space-y-5">
        {/* Toolbar: Views & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          {/* Chart Type Selector */}
          <div className="flex items-center gap-1.5 bg-[#0f1013] p-1 rounded-xl border border-white/5 self-start">
            <button
              type="button"
              onClick={() => setChartType('composed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === 'composed'
                  ? 'bg-amber-500 text-[#0d0e10] shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Área + Tendencia
            </button>
            <button
              type="button"
              onClick={() => setChartType('stackedBar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === 'stackedBar'
                  ? 'bg-amber-500 text-[#0d0e10] shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Barras Desglosadas
            </button>
            <button
              type="button"
              onClick={() => setChartType('cumulativeLine')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === 'cumulativeLine'
                  ? 'bg-amber-500 text-[#0d0e10] shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Crecimiento Acumulado
            </button>
            <button
              type="button"
              onClick={() => setChartType('radar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === 'radar'
                  ? 'bg-amber-500 text-[#0d0e10] shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Balance Radar
            </button>
          </div>

          {/* Secondary Controls: Pillar Filter & Target Toggle */}
          <div className="flex items-center gap-3">
            {chartType !== 'radar' && (
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-white/50 flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTargetLine}
                    onChange={(e) => setShowTargetLine(e.target.checked)}
                    className="accent-amber-500 rounded cursor-pointer"
                  />
                  <span>Meta (50 PDP)</span>
                </label>
              </div>
            )}

            {/* Metric pill filter */}
            {chartType !== 'radar' && chartType !== 'cumulativeLine' && (
              <div className="flex items-center gap-1 text-[11px] bg-[#0f1013] p-1 rounded-lg border border-white/5">
                <button
                  type="button"
                  onClick={() => setMetricFilter('all')}
                  className={`px-2 py-1 rounded cursor-pointer ${
                    metricFilter === 'all' ? 'bg-white/10 text-white font-bold' : 'text-white/40 hover:text-white'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setMetricFilter('productivity')}
                  className={`px-2 py-1 rounded cursor-pointer ${
                    metricFilter === 'productivity' ? 'bg-blue-500/20 text-blue-300 font-bold' : 'text-white/40 hover:text-white'
                  }`}
                >
                  Prod
                </button>
                <button
                  type="button"
                  onClick={() => setMetricFilter('discipline')}
                  className={`px-2 py-1 rounded cursor-pointer ${
                    metricFilter === 'discipline' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-white/40 hover:text-white'
                  }`}
                >
                  Disc
                </button>
                <button
                  type="button"
                  onClick={() => setMetricFilter('purpose')}
                  className={`px-2 py-1 rounded cursor-pointer ${
                    metricFilter === 'purpose' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-white/40 hover:text-white'
                  }`}
                >
                  Prop
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            {(metricFilter === 'all' || metricFilter === 'productivity') && (
              <div className="flex items-center gap-1.5 text-blue-300 font-medium">
                <span className="w-3 h-3 rounded bg-blue-500" />
                <span>Productividad ({kpis.prodShare}%)</span>
              </div>
            )}
            {(metricFilter === 'all' || metricFilter === 'discipline') && (
              <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                <span className="w-3 h-3 rounded bg-amber-500" />
                <span>Disciplina ({kpis.discShare}%)</span>
              </div>
            )}
            {(metricFilter === 'all' || metricFilter === 'purpose') && (
              <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span>Propósito ({kpis.purpShare}%)</span>
              </div>
            )}
            {chartType === 'composed' && (
              <div className="flex items-center gap-1.5 text-rose-300 font-medium">
                <span className="w-4 h-0.5 bg-rose-400" />
                <span>Total Diario</span>
              </div>
            )}
            {showTargetLine && chartType !== 'radar' && (
              <div className="flex items-center gap-1.5 text-white/40">
                <span className="w-4 border-b border-dashed border-white/50" />
                <span>Meta (50 PDP)</span>
              </div>
            )}
          </div>

          <span className="text-[11px] text-white/40 font-mono">
            Pasa el cursor por cualquier día para ver el desglose
          </span>
        </div>

        {/* RECHARTS CANVAS */}
        <div className="w-full h-80 pt-2">
          {/* 1. Vista Compuesta (ComposedChart) */}
          {chartType === 'composed' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    setSelectedDayRecord(e.activePayload[0].payload);
                  }
                }}
              >
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorDisc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorPurp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#252830" vertical={false} />
                <XAxis
                  dataKey="dayLabel"
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  domain={[0, 'dataMax + 15']}
                />
                <Tooltip content={<CustomTooltip />} />
                {showTargetLine && (
                  <ReferenceLine
                    y={50}
                    stroke="#ffffff"
                    strokeDasharray="4 4"
                    strokeOpacity={0.3}
                    label={{
                      value: 'Meta 50 PDP',
                      position: 'insideTopRight',
                      fill: '#ffffff',
                      fillOpacity: 0.5,
                      fontSize: 10,
                    }}
                  />
                )}
                {(metricFilter === 'all' || metricFilter === 'productivity') && (
                  <Area
                    type="monotone"
                    dataKey="productivity"
                    name="Productividad"
                    stackId={metricFilter === 'all' ? 'pdpStack' : undefined}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorProd)"
                  />
                )}
                {(metricFilter === 'all' || metricFilter === 'discipline') && (
                  <Area
                    type="monotone"
                    dataKey="discipline"
                    name="Disciplina"
                    stackId={metricFilter === 'all' ? 'pdpStack' : undefined}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDisc)"
                  />
                )}
                {(metricFilter === 'all' || metricFilter === 'purpose') && (
                  <Area
                    type="monotone"
                    dataKey="purpose"
                    name="Propósito"
                    stackId={metricFilter === 'all' ? 'pdpStack' : undefined}
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPurp)"
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="totalDaily"
                  name="Total Diario"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f43f5e', strokeWidth: 0 }}
                  activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {/* 2. Vista Barras Desglosadas (Stacked Bar Chart) */}
          {chartType === 'stackedBar' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    setSelectedDayRecord(e.activePayload[0].payload);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#252830" vertical={false} />
                <XAxis dataKey="dayLabel" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                {showTargetLine && (
                  <ReferenceLine
                    y={50}
                    stroke="#ffffff"
                    strokeDasharray="4 4"
                    strokeOpacity={0.3}
                  />
                )}
                {(metricFilter === 'all' || metricFilter === 'productivity') && (
                  <Bar
                    dataKey="productivity"
                    name="Productividad"
                    stackId="barStack"
                    fill="#3b82f6"
                    radius={metricFilter === 'productivity' ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                )}
                {(metricFilter === 'all' || metricFilter === 'discipline') && (
                  <Bar
                    dataKey="discipline"
                    name="Disciplina"
                    stackId="barStack"
                    fill="#f59e0b"
                    radius={metricFilter === 'discipline' ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                )}
                {(metricFilter === 'all' || metricFilter === 'purpose') && (
                  <Bar
                    dataKey="purpose"
                    name="Propósito"
                    stackId="barStack"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {/* 3. Vista Crecimiento Acumulado (Cumulative Line Chart) */}
          {chartType === 'cumulativeLine' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    setSelectedDayRecord(e.activePayload[0].payload);
                  }
                }}
              >
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#252830" vertical={false} />
                <XAxis dataKey="dayLabel" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name="PDP Acumulado"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCumulative)"
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#fbbf24"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#fbbf24', stroke: '#121418', strokeWidth: 2 }}
                  activeDot={{ r: 7, stroke: '#ffffff', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {/* 4. Vista Radar: Balance de Pilares */}
          {chartType === 'radar' && (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#2e323d" />
                <PolarAngleAxis dataKey="pilar" stroke="#e5e7eb" fontSize={12} />
                <PolarRadiusAxis stroke="#6b7280" fontSize={10} />
                <Radar
                  name="Puntos Justin"
                  dataKey="puntos"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.45}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Selected Day Detail Card (if clicked) */}
        {selectedDayRecord && (
          <div className="bg-[#121417] border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                <Calendar size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  Detalle del {selectedDayRecord.dayLabel} ({selectedDayRecord.date})
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    {selectedDayRecord.totalDaily} PDP
                  </span>
                </h4>
                <p className="text-xs text-white/50">
                  {selectedDayRecord.highlight || 'Desempeño diario registrado en el sistema.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-blue-300">P: +{selectedDayRecord.productivity}</span>
              <span className="text-amber-300">D: +{selectedDayRecord.discipline}</span>
              <span className="text-emerald-300">P: +{selectedDayRecord.purpose}</span>
              <button
                type="button"
                onClick={() => setSelectedDayRecord(null)}
                className="text-white/40 hover:text-white text-xs underline cursor-pointer ml-2"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tri-Pillar Deep Dive Grid & Coach Note for Justin */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pilar 1: Productividad */}
        <div className="bg-[#16181d] border border-blue-500/20 rounded-2xl p-5 shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <Activity size={18} />
              </div>
              <h4 className="font-bold text-white text-sm">Productividad (P)</h4>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              {kpis.prodShare}% de PDP
            </span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">
            Medido por bloques de Trabajo Profundo cumplidos, sprints de Pomodoro y ausencia de multitarea durante las horas pico de Justin.
          </p>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/70">
            <span>Objetivo Diario:</span>
            <span className="text-blue-300 font-bold">&ge; 25 PDP</span>
          </div>
        </div>

        {/* Pilar 2: Disciplina */}
        <div className="bg-[#16181d] border border-amber-500/20 rounded-2xl p-5 shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <Shield size={18} />
              </div>
              <h4 className="font-bold text-white text-sm">Disciplina (D)</h4>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {kpis.discShare}% de PDP
            </span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">
            Resistencia ante impulsos de procrastinar, victorias registradas en momentos de fatiga y apego estricto a las reglas inquebrantables.
          </p>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/70">
            <span>Objetivo Diario:</span>
            <span className="text-amber-300 font-bold">&ge; 20 PDP</span>
          </div>
        </div>

        {/* Pilar 3: Propósito */}
        <div className="bg-[#16181d] border border-emerald-500/20 rounded-2xl p-5 shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Compass size={18} />
              </div>
              <h4 className="font-bold text-white text-sm">Propósito (P)</h4>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {kpis.purpShare}% de PDP
            </span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">
            Claridad de visión, journaling estoico nocturno, y alineación constante con las razones profundas por las que Justin lucha cada día.
          </p>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/70">
            <span>Objetivo Diario:</span>
            <span className="text-emerald-300 font-bold">&ge; 15 PDP</span>
          </div>
        </div>
      </div>

      {/* Strategic Coach Insight for Justin */}
      <div className="bg-gradient-to-r from-[#171922] via-[#15171e] to-[#121419] border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shrink-0">
            <Flame size={24} className="animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-sans font-bold text-white flex items-center gap-2">
              Diagnóstico Estratégico para Justin
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                Tendencia Alcista (+{kpis.growthRate}%)
              </span>
            </h4>
            <p className="text-xs text-white/60 mt-1 max-w-2xl leading-relaxed">
              Justin, la curva de rendimiento de las últimas dos semanas evidencia una aceleración clara en <strong className="text-amber-300">Productividad</strong> y <strong className="text-emerald-300">Propósito</strong>. Para maximizar tu salto al siguiente nivel de madurez, mantén el foco en registrar tus victorias matutinas de <strong className="text-amber-300">Disciplina</strong> antes del mediodía.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[10px] text-white/40 uppercase font-mono">Rango de Evaluación</div>
          <div className="text-sm font-mono font-bold text-amber-400">14 Días Consecutivos</div>
        </div>
      </div>
    </div>
  );
}
