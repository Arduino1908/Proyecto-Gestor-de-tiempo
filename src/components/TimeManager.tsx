import { useState, useEffect, useRef, FormEvent } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash, Check, Clock, Sparkles, Volume2, Info, Bell, X } from 'lucide-react';
import { TimeBlock, UserProfile } from '../types';

interface TimeManagerProps {
  profile?: UserProfile | null;
  timeBlocks: TimeBlock[];
  onAddBlock: (block: Omit<TimeBlock, 'id'>) => void;
  onCompleteBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onAddPDP: (points: number, reason: string) => void;
}

const CATEGORIES = [
  { id: 'Deep Work', label: 'Trabajo Profundo', color: 'bg-amber-500/10 text-amber-300 border-amber-500/20', icon: '⚡' },
  { id: 'Admin', label: 'Gestión / Admin', color: 'bg-zinc-500/10 text-zinc-300 border-white/10', icon: '📁' },
  { id: 'Learning', label: 'Aprendizaje / Lectura', color: 'bg-blue-500/10 text-blue-300 border-blue-500/20', icon: '📖' },
  { id: 'Routine', label: 'Rutina / Pausa', color: 'bg-purple-500/10 text-purple-300 border-purple-500/20', icon: '🔄' },
  { id: 'Meeting', label: 'Reunión / Sincro', color: 'bg-rose-500/10 text-rose-300 border-rose-500/20', icon: '👥' },
];

export default function TimeManager({
  profile,
  timeBlocks,
  onAddBlock,
  onCompleteBlock,
  onDeleteBlock,
  onAddPDP,
}: TimeManagerProps) {
  // Pomodoro States
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [totalSessions, setTotalSessions] = useState(0);

  // Linked Focus Block State
  const [linkedBlockId, setLinkedBlockId] = useState<string | null>(null);
  const [customWorkDuration, setCustomWorkDuration] = useState(25); // In minutes

  // Dynamic Soft Notification Toast States
  interface BlockToast {
    id: string;
    blockId: string;
    title: string;
    scheduledAt: string;
    duration: number;
    minutesRemaining: number;
  }
  const [toasts, setToasts] = useState<BlockToast[]>([]);
  const [notifiedBlockIds, setNotifiedBlockIds] = useState<Record<string, boolean>>({});
  const [sessionAlertModal, setSessionAlertModal] = useState<{ title: string; message: string; badge?: string } | null>(null);

  const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return 0;
    const [hours, minutes] = parts.map(Number);
    if (isNaN(hours) || isNaN(minutes)) return 0;
    return hours * 60 + minutes;
  };

  // Time Blocker States
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState(30);
  const [newCategory, setNewCategory] = useState<'Deep Work' | 'Admin' | 'Learning' | 'Routine' | 'Meeting'>('Deep Work');
  const [newScheduledAt, setNewScheduledAt] = useState('09:00');

  // Quick Preset Templates
  const PRESET_TEMPLATES = [
    { title: 'Trabajo Enfocado', duration: 45, category: 'Deep Work' as const, icon: '⚡', desc: 'Trabajo profundo sin distracciones' },
    { title: 'Revisión / Admin', duration: 20, category: 'Admin' as const, icon: '📁', desc: 'Responder correos, Slack y mensajería' },
    { title: 'Estudio / Lectura', duration: 30, category: 'Learning' as const, icon: '📖', desc: 'Desarrollo profesional y lectura' },
    { title: 'Rutina Diaria', duration: 15, category: 'Routine' as const, icon: '🔄', desc: 'Rutinas, estiramientos o pausas' },
    { title: 'Reunión / Sincro', duration: 30, category: 'Meeting' as const, icon: '👥', desc: 'Alineación de objetivos con equipo' },
  ];

  const handleApplyTemplate = (title: string, duration: number, category: 'Deep Work' | 'Admin' | 'Learning' | 'Routine' | 'Meeting') => {
    setNewTitle(title);
    setNewDuration(duration);
    setNewCategory(category);
    
    // Auto-fill time to exact current hour/minute
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    setNewScheduledAt(`${hh}:${mm}`);
  };

  // Set default scheduled hour dynamically to current time on mount
  useEffect(() => {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    setNewScheduledAt(`${hh}:${mm}`);
  }, []);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const tickRef = useRef<(() => void) | undefined>(undefined);

  // Map modes to times (in seconds)
  const modeTimes = {
    work: customWorkDuration * 60,
    break: 15 * 60,
  };

  const [timeLeft, setTimeLeft] = useState(25 * 60); // Initialized standard

  useEffect(() => {
    setTimeLeft(modeTimes[timerMode]);
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    endTimeRef.current = null;
  }, [timerMode, customWorkDuration]);

  // Keep tick reference updated to avoid React closure stale-state issues
  useEffect(() => {
    tickRef.current = tick;
  });

  // Listen to browser tab visibility to sync instantly if the tab was suspended or in background
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isRunning && endTimeRef.current !== null) {
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0 && tickRef.current) {
          tickRef.current();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isRunning]);

  // Gentle audio chime for block starting notifications using Web Audio API
  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.12); // E5
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      osc2.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.12); // G5

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.5);
      osc2.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('AudioContext not allowed or not supported yet.', e);
    }
  };

  // Background loop to check scheduled blocks and send soft notifications
  useEffect(() => {
    const checkScheduledBlocks = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      timeBlocks.forEach((block) => {
        if (block.completed) return;

        const blockMinutes = timeToMinutes(block.scheduledAt);
        const diff = blockMinutes - currentMinutes;

        // If the block is about to start (starting within 0 to 5 minutes) and not notified
        if (diff >= 0 && diff <= 5 && !notifiedBlockIds[block.id]) {
          const newToast: BlockToast = {
            id: Math.random().toString(36).substring(2, 9),
            blockId: block.id,
            title: block.title,
            scheduledAt: block.scheduledAt,
            duration: block.duration,
            minutesRemaining: diff,
          };

          playNotificationSound();

          setToasts((prev) => {
            if (prev.some((t) => t.blockId === block.id)) return prev;
            return [...prev, newToast];
          });

          setNotifiedBlockIds((prev) => ({
            ...prev,
            [block.id]: true,
          }));
        }
      });
    };

    // Run immediately and check every 5 seconds
    checkScheduledBlocks();
    const interval = setInterval(checkScheduledBlocks, 5000);
    return () => clearInterval(interval);
  }, [timeBlocks, notifiedBlockIds]);

  // Clean up toasts for blocks that get completed or deleted
  useEffect(() => {
    setToasts((prev) => prev.filter((t) => {
      const block = timeBlocks.find((b) => b.id === t.blockId);
      return block && !block.completed;
    }));
  }, [timeBlocks]);

  // Audio Synth beep effect using standard Web Audio API
  const playCompletionSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5 note (High beep)
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);

      // Second tone a bit later for a nice harmony
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5 note
        gain2.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.0);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 1.0);
      }, 200);

    } catch (e) {
      console.log('Audio synthesis failed or is blocked by browser interaction guidelines:', e);
    }
  };

  const tick = () => {
    if (!endTimeRef.current) return;
    const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
    
    setTimeLeft(remaining);

    if (remaining <= 0) {
      setIsRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      endTimeRef.current = null;
      
      playCompletionSound();
      
      // Handle Session End
      if (timerMode === 'work') {
        if (linkedBlockId) {
          const block = timeBlocks.find(b => b.id === linkedBlockId);
          if (block) {
            onCompleteBlock(block.id);
            onAddPDP(50 + 30, `Completar bloque Pomodoro vinculado: "${block.title}" (${customWorkDuration} min)`);
            setSessionAlertModal({
              title: '¡Bloque y Pomodoro Conquistados!',
              message: `¡Espectacular, ${profile?.name || 'Justin'}! El bloque "${block.title}" ha sido completado automáticamente por finalizar el Pomodoro de ${customWorkDuration} minutos. Has ganado un total de +80 PDP.`,
              badge: '+80 PDP Ganados'
            });
            setLinkedBlockId(null);
          } else {
            onAddPDP(50, `Completar Pomodoro adaptado (${customWorkDuration} min)`);
            setSessionAlertModal({
              title: '¡Sesión de Enfoque Completada!',
              message: `¡Gran trabajo, ${profile?.name || 'Justin'}! Has ganado +50 PDP por finalizar tu sesión de ${customWorkDuration} minutos.`,
              badge: '+50 PDP'
            });
          }
        } else {
          onAddPDP(50, `Completar Pomodoro adaptado (${customWorkDuration} min)`);
          setSessionAlertModal({
            title: '¡Sesión de Enfoque Completada!',
            message: `¡Gran trabajo, ${profile?.name || 'Justin'}! Has ganado +50 Puntos de Disciplina (PDP) por finalizar tu sesión de ${customWorkDuration} minutos. Disfruta un descanso estratégico.`,
            badge: '+50 PDP'
          });
        }
        setTotalSessions((prev) => prev + 1);
        setTimerMode('break');
      } else {
        setSessionAlertModal({
          title: 'Descanso Finalizado',
          message: `El tiempo de descanso ha concluido, ${profile?.name || 'Justin'}. Es momento de volver al flujo de alto rendimiento.`,
          badge: 'Hora de Enfocar'
        });
        setTimerMode('work');
      }
    }
  };

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      endTimeRef.current = null;
    } else {
      setIsRunning(true);
      endTimeRef.current = Date.now() + (timeLeft * 1000);
      timerRef.current = setInterval(() => {
        if (tickRef.current) tickRef.current();
      }, 1000);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    endTimeRef.current = null;
    setTimeLeft(modeTimes[timerMode]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddBlock = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddBlock({
      title: newTitle.trim(),
      duration: Number(newDuration),
      category: newCategory,
      completed: false,
      scheduledAt: newScheduledAt,
    });

    setNewTitle('');
    // award +10 pdp for planning
    onAddPDP(10, 'Planificación proactiva de bloque de tiempo');
  };

  // Progress circle math
  const maxTime = modeTimes[timerMode];
  const progressPercent = ((maxTime - timeLeft) / maxTime) * 100;
  const strokeDashoffset = 282.6 - (282.6 * progressPercent) / 100; // Radius 45 -> Circumference 282.6

  return (
    <div id="time-manager" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* LEFT: Dynamic Time Blocker (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-[#16181d] border border-white/5 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-xl font-sans font-bold text-white flex items-center gap-2">
                <Clock size={20} className="text-amber-400" /> Agenda y Planificación de Tiempo
              </h3>
              <p className="text-xs text-white/40 mt-1">Estructura tu jornada. Un clic para rellenar o vincular directamente con el Pomodoro.</p>
            </div>
            <span className="text-xs font-mono font-bold bg-white/5 text-amber-200 px-2 py-1 rounded border border-white/10">
              {timeBlocks.length} {timeBlocks.length === 1 ? 'Bloque' : 'Bloques'}
            </span>
          </div>

          {/* QUICK PRESETS SECTION */}
          <div className="mb-6 bg-[#121417] border border-white/5 rounded-xl p-4">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block mb-2.5 flex items-center gap-1.5">
              <Sparkles size={11} className="text-amber-400" /> Plantillas de Clic Rápido (Autocompletar)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {PRESET_TEMPLATES.map((preset, idx) => (
                <button
                  key={idx}
                  id={`preset-btn-${idx}`}
                  type="button"
                  onClick={() => handleApplyTemplate(preset.title, preset.duration, preset.category)}
                  className="bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-amber-500/30 rounded-xl p-2.5 text-left cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0"
                  title={`Cargar en el formulario: ${preset.title} (${preset.duration} min)`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <span className="shrink-0">{preset.icon}</span>
                    <span className="truncate text-[11px]">{preset.title}</span>
                  </div>
                  <div className="text-[10px] font-mono text-white/40 mt-1 flex items-center justify-between">
                    <span>{preset.duration} min</span>
                    <span className="text-[9px] text-amber-400/60 font-semibold uppercase font-sans">Usar</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form to Add Block */}
          <form onSubmit={handleAddBlock} className="bg-[#121417]/80 border border-white/10 rounded-xl p-4 mb-6 space-y-4">
            <h4 className="text-xs font-mono font-bold text-amber-200 uppercase tracking-widest">Crear o Personalizar Bloque</h4>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Title input */}
              <div className="md:col-span-5">
                <label htmlFor="block-title-input" className="block text-[10px] font-mono font-bold text-white/40 uppercase mb-1.5">Título del Bloque</label>
                <input
                  id="block-title-input"
                  type="text"
                  placeholder="Ej. Análisis de métricas, Programar módulo..."
                  className="w-full text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              {/* Category Select */}
              <div className="md:col-span-4">
                <label htmlFor="block-category-select" className="block text-[10px] font-mono font-bold text-white/40 uppercase mb-1.5">Categoría</label>
                <select
                  id="block-category-select"
                  className="w-full text-xs bg-[#1d2026] border border-white/10 rounded-lg px-2.5 py-2.5 text-white/80 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                >
                  <option value="Deep Work">⚡ Trabajo Profundo</option>
                  <option value="Admin">📁 Gestión / Administración</option>
                  <option value="Learning">📖 Aprendizaje / Lectura</option>
                  <option value="Routine">🔄 Rutina Diaria / Pausa</option>
                  <option value="Meeting">👥 Reunión / Sincro</option>
                </select>
              </div>

              {/* Time and Duration Picker */}
              <div className="md:col-span-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="block-time-input" className="block text-[10px] font-mono font-bold text-white/40 uppercase mb-1.5">Hora</label>
                    <div className="flex gap-1">
                      <input
                        id="block-time-input"
                        type="time"
                        className="w-full text-xs bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        value={newScheduledAt}
                        onChange={(e) => setNewScheduledAt(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const hh = now.getHours().toString().padStart(2, '0');
                          const mm = now.getMinutes().toString().padStart(2, '0');
                          setNewScheduledAt(`${hh}:${mm}`);
                        }}
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:text-amber-400 rounded-lg text-xs cursor-pointer transition-colors"
                        title="Usar la hora actual del sistema"
                      >
                        ⏰
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="block-duration-input" className="block text-[10px] font-mono font-bold text-white/40 uppercase mb-1.5">Minutos</label>
                    <div className="flex items-center justify-between bg-[#1d2026] border border-white/10 rounded-lg p-1 text-white">
                      <button
                        type="button"
                        onClick={() => setNewDuration(prev => Math.max(10, prev - 5))}
                        className="text-white/40 hover:text-white px-2 py-1 text-xs font-bold cursor-pointer hover:bg-white/5 rounded"
                        title="Restar 5 minutos"
                      >
                        -
                      </button>
                      <input
                        id="block-duration-input"
                        type="number"
                        min="10"
                        max="180"
                        step="5"
                        className="w-8 text-xs bg-transparent text-white focus:outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={newDuration}
                        onChange={(e) => setNewDuration(Number(e.target.value))}
                        title="Duración en minutos"
                      />
                      <button
                        type="button"
                        onClick={() => setNewDuration(prev => Math.min(180, prev + 5))}
                        className="text-white/40 hover:text-white px-2 py-1 text-xs font-bold cursor-pointer hover:bg-white/5 rounded"
                        title="Sumar 5 minutos"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-1">
              <span className="text-[10px] text-white/40 flex items-center gap-1">
                <Info size={12} className="text-amber-400" /> Planificar proactivamente te otorga <span className="font-mono font-bold text-amber-200">+10 PDP</span>.
              </span>
              <button
                id="add-block-submit-btn"
                type="submit"
                className="bg-amber-500 text-[#0d0e10] px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-amber-400 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus size={14} /> Agendar Bloque
              </button>
            </div>
          </form>

          {/* List of Blocks */}
          <div className="space-y-3" id="time-blocks-list">
            {timeBlocks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                <p className="text-sm text-white/40">No hay bloques agendados para hoy.</p>
                <p className="text-xs text-white/30 mt-1">¡Utiliza las plantillas rápidas de arriba para planificar en un segundo!</p>
              </div>
            ) : (
              timeBlocks
                .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
                .map((block) => {
                  const catConfig = CATEGORIES.find(c => c.id === block.category || c.label === block.category) || CATEGORIES[0];
                  return (
                    <div
                      key={block.id}
                      id={`block-card-${block.id}`}
                      className={`p-4 border rounded-xl flex items-center justify-between transition-all ${
                        block.completed
                          ? 'bg-white/[0.02] border-white/5 opacity-50 line-through'
                          : 'bg-[#121417]/90 border-white/10 hover:border-white/20 shadow-lg'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono font-bold text-amber-200 bg-white/5 border border-white/10 px-2 py-1 rounded">
                          {block.scheduledAt}
                        </span>
                        <div>
                          <h5 className="text-sm font-semibold text-white/90 flex flex-wrap items-center gap-2">
                            {block.title}
                            {linkedBlockId === block.id && (
                              <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />
                                🎯 Enfocado
                              </span>
                            )}
                          </h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border ${catConfig.color}`}>
                              {catConfig.icon} {catConfig.label}
                            </span>
                            <span className="text-white/40 text-[10px] flex items-center gap-0.5">
                              <Clock size={10} /> {block.duration} mins
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!block.completed && (
                          <>
                            <button
                              id={`link-block-${block.id}`}
                              type="button"
                              onClick={() => {
                                setLinkedBlockId(block.id);
                                setCustomWorkDuration(block.duration);
                                setTimerMode('work');
                                setIsRunning(false);
                                setTimeLeft(block.duration * 60);
                              }}
                              className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                                linkedBlockId === block.id
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-semibold'
                                  : 'text-white/40 hover:text-white hover:bg-white/5 border-white/10'
                              }`}
                              title={linkedBlockId === block.id ? 'Vincular y enfocar con Pomodoro (activo)' : 'Vincular y adaptar duración del Pomodoro'}
                            >
                              <Sparkles size={14} className={linkedBlockId === block.id ? 'text-amber-400 animate-pulse' : 'text-white/40'} />
                            </button>

                            <button
                              id={`complete-block-${block.id}`}
                              type="button"
                              onClick={() => {
                                onCompleteBlock(block.id);
                                onAddPDP(30, `Completar bloque programado: ${block.title}`);
                                if (linkedBlockId === block.id) {
                                  setLinkedBlockId(null);
                                }
                              }}
                              className="p-1.5 text-amber-400 hover:bg-amber-400/10 rounded-lg border border-amber-500/20 cursor-pointer transition-colors"
                              title="Completar bloque"
                            >
                              <Check size={14} />
                            </button>
                          </>
                        )}
                        <button
                          id={`delete-block-${block.id}`}
                          type="button"
                          onClick={() => onDeleteBlock(block.id)}
                          className="p-1.5 text-white/30 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                          title="Eliminar bloque"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: High-Fidelity Pomodoro Countdown (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#16181d] border border-white/5 rounded-2xl p-6 shadow-xl text-center flex flex-col items-center">
          <div className="w-full text-left mb-6">
            <h3 className="text-xl font-sans font-bold text-white flex items-center gap-2">
              <Sparkles size={20} className="text-amber-400 animate-pulse" /> Pomodoro de Alto Enfoque
            </h3>
            <p className="text-xs text-white/40 mt-1">Bloques alternados de enfoque duro y descanso reparador.</p>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex bg-[#121417] p-1 border border-white/10 rounded-xl w-full max-w-sm mb-5" id="pomodoro-modes">
            <button
              id="mode-work-btn"
              type="button"
              onClick={() => setTimerMode('work')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                timerMode === 'work' ? 'bg-amber-500 text-[#0d0e10] font-bold shadow-sm' : 'text-white/40 hover:text-white'
              }`}
            >
              🎯 Enfoque ({customWorkDuration}m)
            </button>
            <button
              id="mode-break-btn"
              type="button"
              onClick={() => setTimerMode('break')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                timerMode === 'break' ? 'bg-[#1d2026] text-white font-bold shadow-sm' : 'text-white/40 hover:text-white'
              }`}
            >
              🌿 Descanso (15m)
            </button>
          </div>

          {/* DYNAMIC FOCUS LINK INDICATOR OR MANUAL TIMER ADAPTATION */}
          {timerMode === 'work' && (
            <div className="w-full max-w-sm mb-6">
              {(() => {
                const linkedBlock = timeBlocks.find(b => b.id === linkedBlockId);
                if (linkedBlock) {
                  return (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-left flex items-center justify-between animate-fade-in">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        <div className="overflow-hidden">
                          <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider block">Trabajando en Bloque:</span>
                          <span className="text-xs font-bold text-white/90 block truncate max-w-[200px]">{linkedBlock.title}</span>
                        </div>
                      </div>
                      <button
                        id="unlink-block-btn"
                        type="button"
                        onClick={() => {
                          setLinkedBlockId(null);
                          setCustomWorkDuration(25);
                        }}
                        className="text-[10px] text-white/40 hover:text-white hover:underline font-mono px-2 py-1 bg-white/5 rounded border border-white/10 cursor-pointer"
                      >
                        Desvincular
                      </button>
                    </div>
                  );
                } else {
                  return (
                    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-2.5 w-full">
                      <span className="text-xs font-semibold text-white/70">Duración Manual:</span>
                      <div className="flex items-center gap-2">
                        <button
                          id="decrease-pomo-btn"
                          type="button"
                          disabled={customWorkDuration <= 5 || isRunning}
                          onClick={() => {
                            const newD = Math.max(5, customWorkDuration - 5);
                            setCustomWorkDuration(newD);
                          }}
                          className="px-2 py-0.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[11px] text-white disabled:opacity-30 cursor-pointer"
                        >
                          -5m
                        </button>
                        <span className="text-xs font-mono font-bold text-amber-200">{customWorkDuration} min</span>
                        <button
                          id="increase-pomo-btn"
                          type="button"
                          disabled={customWorkDuration >= 180 || isRunning}
                          onClick={() => {
                            const newD = Math.min(180, customWorkDuration + 5);
                            setCustomWorkDuration(newD);
                          }}
                          className="px-2 py-0.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[11px] text-white disabled:opacity-30 cursor-pointer"
                        >
                          +5m
                        </button>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
          )}

          {/* Large Countdown Dial */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-8">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-white/5"
                strokeWidth="4"
                fill="transparent"
              />
              {/* Glowing animated path */}
              <circle
                cx="50"
                cy="50"
                r="45"
                className={`transition-all duration-300 ${
                  timerMode === 'work' ? 'stroke-amber-400' : 'stroke-indigo-400'
                }`}
                strokeWidth="4.5"
                fill="transparent"
                strokeDasharray="282.6"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Center Content */}
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-mono font-bold text-white tracking-tight select-all">
                {formatTime(timeLeft)}
              </span>
              <span className="text-amber-400 text-[10px] uppercase font-mono tracking-widest mt-1.5">
                {timerMode === 'work' ? 'Profundo' : 'Descanso'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              id="pomodoro-toggle-btn"
              type="button"
              onClick={toggleTimer}
              className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all ${
                isRunning
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  : 'bg-amber-500 text-black hover:bg-amber-400 ring-4 ring-amber-500/10'
              }`}
              title={isRunning ? 'Pausar' : 'Iniciar'}
            >
              {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </button>
            
            <button
              id="pomodoro-reset-btn"
              type="button"
              onClick={resetTimer}
              className="w-14 h-14 rounded-full border border-white/10 text-white/60 hover:text-white hover:bg-white/5 flex items-center justify-center cursor-pointer transition-colors"
              title="Reiniciar"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          {/* Stats Summary */}
          <div className="w-full bg-[#121417]/90 border border-white/10 rounded-xl p-4 flex justify-around text-left">
            <div>
              <span className="text-[10px] text-white/30 uppercase font-mono tracking-wide block">Completados</span>
              <span className="text-base font-mono font-bold text-white">{totalSessions} bloques</span>
            </div>
            <div className="border-r border-white/10 h-10 my-auto" />
            <div>
              <span className="text-[10px] text-white/30 uppercase font-mono tracking-wide block">Puntos Ganados</span>
              <span className="text-base font-mono font-bold text-amber-400">+{totalSessions * 50} PDP</span>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING TOAST NOTIFICATIONS */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none" id="notifications-toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className="bg-[#1b1c21] border border-amber-500/30 rounded-xl p-4 shadow-2xl pointer-events-auto animate-fade-in flex flex-col gap-3 border-l-4 border-l-amber-500"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20 shrink-0">
                  <Bell size={16} className="animate-bounce text-amber-400" />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                    {toast.minutesRemaining === 0
                      ? '¡Comienza Ahora!'
                      : `Por comenzar en ${toast.minutesRemaining} ${toast.minutesRemaining === 1 ? 'minuto' : 'minutos'}`}
                  </span>
                  <h4 className="text-xs font-bold text-white leading-tight mt-0.5">{toast.title}</h4>
                  <span className="text-[10px] font-mono text-white/40 block mt-0.5">
                    Programado a las {toast.scheduledAt} ({toast.duration} min)
                  </span>
                </div>
              </div>
              <button
                id={`dismiss-toast-${toast.id}`}
                type="button"
                onClick={() => {
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                }}
                className="text-white/40 hover:text-white p-1 hover:bg-white/5 rounded transition-colors cursor-pointer shrink-0"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex items-center gap-2 border-t border-white/5 pt-2.5">
              <button
                id={`toast-focus-btn-${toast.id}`}
                type="button"
                onClick={() => {
                  setLinkedBlockId(toast.blockId);
                  setCustomWorkDuration(toast.duration);
                  setTimerMode('work');
                  setIsRunning(false);
                  setTimeLeft(toast.duration * 60);
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                  setSessionAlertModal({
                    title: '¡Bloque Vinculado al Pomodoro!',
                    message: `El temporizador se configuró para ${toast.duration} minutos para "${toast.title}". Presiona Play para arrancar con toda la concentración.`,
                    badge: `${toast.duration} Minutos`
                  });
                }}
                className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-[#0d0e10] text-[11px] font-bold rounded-lg text-center cursor-pointer transition-all flex items-center justify-center gap-1"
              >
                <Sparkles size={11} /> Vincular y Enfocar
              </button>
              <button
                id={`toast-dismiss-alt-btn-${toast.id}`}
                type="button"
                onClick={() => {
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                }}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[11px] font-medium rounded-lg text-center cursor-pointer transition-all border border-white/10"
              >
                Entendido
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* IN-APP SESSION ALERT MODAL (REPLACES WINDOW.ALERT) */}
      {sessionAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181d] border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{sessionAlertModal.title}</h3>
                  {sessionAlertModal.badge && (
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 inline-block mt-0.5">
                      {sessionAlertModal.badge}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSessionAlertModal(null)}
                className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-white/80 leading-relaxed">
              {sessionAlertModal.message}
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSessionAlertModal(null)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-[#0d0e10] font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check size={14} /> ¡Entendido!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
