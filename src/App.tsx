import { useState, useEffect } from 'react';
import { UserProfile, TimeBlock, IncidentLog, Badge, StoicJournalEntry } from './types';
import Onboarding from './components/Onboarding';
import TimeManager from './components/TimeManager';
import Diagnostics from './components/Diagnostics';
import MotivationEngine from './components/MotivationEngine';
import Gamification from './components/Gamification';
import BlueprintView from './components/BlueprintView';
import StoicJournal from './components/StoicJournal';
import PDPProgressChart from './components/PDPProgressChart';
import { Clock, ShieldAlert, Award, Compass, RefreshCw, Sparkles, HelpCircle, ChevronDown, ChevronUp, BookOpen, Flame, X, AlertTriangle, TrendingUp } from 'lucide-react';
import { safeStorage } from './utils/safeStorage';

const INITIAL_BADGES: Badge[] = [
  {
    id: 'pacto_honor',
    title: 'Pacto de Honor',
    description: 'Completaste el onboarding de disciplina asumiendo la responsabilidad de tu enfoque.',
    icon: 'Shield',
    unlocked: true,
    pointsRequired: 100,
    category: 'resilience',
  },
  {
    id: 'cronos',
    title: 'Planificador Proactivo',
    description: 'Agendaste tu primer bloque de tiempo estructurado en la línea de tiempo.',
    icon: 'Clock',
    unlocked: false,
    pointsRequired: 110,
    category: 'organization',
  },
  {
    id: 'focus_deep',
    title: 'Foco Profundo',
    description: 'Completaste exitosamente una sesión de Pomodoro de 25 minutos.',
    icon: 'Zap',
    unlocked: false,
    pointsRequired: 150,
    category: 'focus',
  },
  {
    id: 'stoic_victory',
    title: 'Victoria Estoica',
    description: 'Registraste tu primera victoria consciente contra tus impulsos de distracción.',
    icon: 'TrendingUp',
    unlocked: false,
    pointsRequired: 190,
    category: 'resilience',
  },
  {
    id: 'habito_hierro',
    title: 'Hábito de Hierro',
    description: 'Acumulaste suficientes puntos para certificar una disciplina sólida.',
    icon: 'Compass',
    unlocked: false,
    pointsRequired: 250,
    category: 'consistency',
  },
  {
    id: 'muralla',
    title: 'Muralla Humana',
    description: 'Alcanzaste el rango de protección total frente a las fugas cognitivas diarias.',
    icon: 'Award',
    unlocked: false,
    pointsRequired: 400,
    category: 'focus',
  },
];

const INITIAL_BLOCKS: TimeBlock[] = [
  {
    id: 'block-1',
    title: 'Planificación de Objetivos de la Semana',
    duration: 30,
    category: 'Routine',
    completed: true,
    scheduledAt: '08:30',
  },
  {
    id: 'block-2',
    title: 'Arquitectura del Modelo de Datos',
    duration: 60,
    category: 'Deep Work',
    completed: false,
    scheduledAt: '10:00',
  },
  {
    id: 'block-3',
    title: 'Sincronización Semanal con Product Manager',
    duration: 30,
    category: 'Meeting',
    completed: false,
    scheduledAt: '12:00',
  },
];

const INITIAL_JOURNAL_ENTRIES: StoicJournalEntry[] = [
  {
    id: 'journal-1',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    whatWentWell: 'Completé tres bloques de Trabajo Profundo seguidos por la mañana. Mantuve el celular apagado y logré avanzar significativamente en el desarrollo del backend sin distraerme.',
    whatWentWrong: 'Por la tarde me sentí cansado y procrastiné unos 30 minutos revisando noticias en lugar de hacer la rutina de estiramientos agendada.',
    howToImprove: 'Para mañana, cuando me sienta fatigado a media tarde, saldré a dar una caminata corta de 5 minutos para oxigenarme en lugar de tomar el celular.',
    calmLevel: 4,
    disciplinedRating: 4,
    pdpAwarded: 25
  },
  {
    id: 'journal-2',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // yesterday
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    whatWentWell: 'Pude aplicar la caminata de 5 minutos cuando me sentí cansado. Evité por completo las redes sociales durante mi jornada de trabajo. Vinculé y completé con éxito un Pomodoro de 45 minutos.',
    whatWentWrong: 'Me conecté a una reunión sin haber revisado la agenda previamente, lo que hizo que fuera menos productiva de lo esperado.',
    howToImprove: 'Revisaré los objetivos y la agenda de cada reunión al menos 10 minutos antes de que empiece.',
    calmLevel: 5,
    disciplinedRating: 5,
    pdpAwarded: 25
  }
];

const DEFAULT_INITIAL_PROFILE: UserProfile = {
  name: 'Justin',
  role: 'Desarrollador de Alto Rendimiento',
  dailyHoursTarget: 6,
  mainWeakness: 'procrastination',
  goals: ['routine', 'skill', 'focus_under_pressure'],
  level: 2,
  pdp: 240,
  streak: 3,
  lastActive: new Date().toISOString(),
  onboarded: true,
};

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(INITIAL_BLOCKS);
  const [incidentLogs, setIncidentLogs] = useState<IncidentLog[]>([]);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [journalEntries, setJournalEntries] = useState<StoicJournalEntry[]>([]);
  
  // Navigation Tabs (Main level)
  const [activeMainTab, setActiveMainTab] = useState<'prototype' | 'blueprint'>('prototype');
  
  // Prototype sub-navigation tabs
  const [activeProtoTab, setActiveProtoTab] = useState<'scheduler' | 'diagnostics' | 'motivation' | 'gamification' | 'analytics' | 'journal'>('scheduler');
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  // Load from safeStorage with infallible fallbacks
  useEffect(() => {
    try {
      const savedProfile = safeStorage.getItem('tempos_profile');
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (parsed && (parsed.name === 'Ernesto' || !parsed.name)) {
            parsed.name = 'Justin';
            safeStorage.setJSON('tempos_profile', parsed);
          }
          setProfile(parsed);
        } catch {
          setProfile(DEFAULT_INITIAL_PROFILE);
        }
      } else {
        setProfile(DEFAULT_INITIAL_PROFILE);
        safeStorage.setJSON('tempos_profile', DEFAULT_INITIAL_PROFILE);
      }

      const savedBlocks = safeStorage.getJSON<TimeBlock[] | null>('tempos_blocks', null);
      if (savedBlocks && Array.isArray(savedBlocks)) {
        setTimeBlocks(savedBlocks);
      }

      const savedIncidents = safeStorage.getJSON<IncidentLog[] | null>('tempos_incidents', null);
      if (savedIncidents && Array.isArray(savedIncidents)) {
        setIncidentLogs(savedIncidents);
      }

      const savedBadges = safeStorage.getJSON<Badge[] | null>('tempos_badges', null);
      if (savedBadges && Array.isArray(savedBadges)) {
        setBadges(savedBadges);
      }

      const savedGuide = safeStorage.getItem('tempos_show_guide');
      if (savedGuide === 'false') {
        setShowGuide(false);
      }

      const savedJournal = safeStorage.getJSON<StoicJournalEntry[] | null>('tempos_journal', null);
      if (savedJournal && Array.isArray(savedJournal)) {
        setJournalEntries(savedJournal);
      } else {
        setJournalEntries(INITIAL_JOURNAL_ENTRIES);
      }
    } catch {
      // Infallible fallback if any unexpected parse issue occurs
      setProfile(DEFAULT_INITIAL_PROFILE);
      setTimeBlocks(INITIAL_BLOCKS);
      setBadges(INITIAL_BADGES);
      setJournalEntries(INITIAL_JOURNAL_ENTRIES);
    }
  }, []);

  // Save to safeStorage helper
  const saveState = (
    newProfile: UserProfile | null,
    newBlocks: TimeBlock[],
    newIncidents: IncidentLog[],
    newBadges: Badge[],
    newJournal?: StoicJournalEntry[]
  ) => {
    if (newProfile) {
      safeStorage.setJSON('tempos_profile', newProfile);
    } else {
      safeStorage.removeItem('tempos_profile');
    }
    safeStorage.setJSON('tempos_blocks', newBlocks);
    safeStorage.setJSON('tempos_incidents', newIncidents);
    safeStorage.setJSON('tempos_badges', newBadges);
    
    const journalToSave = newJournal !== undefined ? newJournal : journalEntries;
    safeStorage.setJSON('tempos_journal', journalToSave);
  };

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    // Sync with initial badges state (first badge is unlocked by default)
    const updatedBadges = INITIAL_BADGES.map((b) => 
      b.id === 'pacto_honor' ? { ...b, unlocked: true, unlockedAt: new Date().toISOString() } : b
    );
    setBadges(updatedBadges);
    setTimeBlocks(INITIAL_BLOCKS);
    setIncidentLogs([]);
    setJournalEntries(INITIAL_JOURNAL_ENTRIES);
    saveState(newProfile, INITIAL_BLOCKS, [], updatedBadges, INITIAL_JOURNAL_ENTRIES);
  };

  const executeResetProfile = () => {
    setProfile(null);
    setTimeBlocks(INITIAL_BLOCKS);
    setIncidentLogs([]);
    setBadges(INITIAL_BADGES);
    setJournalEntries(INITIAL_JOURNAL_ENTRIES);
    safeStorage.removeItem('tempos_profile');
    safeStorage.removeItem('tempos_blocks');
    safeStorage.removeItem('tempos_incidents');
    safeStorage.removeItem('tempos_badges');
    safeStorage.removeItem('tempos_journal');
    setShowResetModal(false);
  };

  // Add PDP Points & Check Level and Badge Progression
  const handleAddPDP = (points: number, reason: string) => {
    if (!profile) return;

    const newPDP = Math.max(profile.pdp + points, 0);
    // level is floor(pdp / 300) + 1
    const newLevel = Math.floor(newPDP / 300) + 1;
    
    const updatedProfile: UserProfile = {
      ...profile,
      pdp: newPDP,
      level: newLevel,
    };

    // Unlock Badges
    const updatedBadges = badges.map((badge) => {
      if (!badge.unlocked && newPDP >= badge.pointsRequired) {
        return {
          ...badge,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        };
      }
      return badge;
    });

    setProfile(updatedProfile);
    setBadges(updatedBadges);
    saveState(updatedProfile, timeBlocks, incidentLogs, updatedBadges);
  };

  // Time Blocker Actions
  const handleAddBlock = (block: Omit<TimeBlock, 'id'>) => {
    const newBlock: TimeBlock = {
      ...block,
      id: `block-${Date.now()}`,
    };
    const updatedBlocks = [...timeBlocks, newBlock];
    setTimeBlocks(updatedBlocks);
    saveState(profile, updatedBlocks, incidentLogs, badges);
  };

  const handleCompleteBlock = (id: string) => {
    const updatedBlocks = timeBlocks.map((b) => 
      b.id === id ? { ...b, completed: true } : b
    );
    setTimeBlocks(updatedBlocks);
    saveState(profile, updatedBlocks, incidentLogs, badges);
  };

  const handleDeleteBlock = (id: string) => {
    const updatedBlocks = timeBlocks.filter((b) => b.id !== id);
    setTimeBlocks(updatedBlocks);
    saveState(profile, updatedBlocks, incidentLogs, badges);
  };

  const handleSaveJournalEntry = (entry: StoicJournalEntry) => {
    const updatedEntries = [...journalEntries, entry];
    setJournalEntries(updatedEntries);
    saveState(profile, timeBlocks, incidentLogs, badges, updatedEntries);
  };

  const handleDeleteJournalEntry = (id: string) => {
    const updatedEntries = journalEntries.filter((e) => e.id !== id);
    setJournalEntries(updatedEntries);
    saveState(profile, timeBlocks, incidentLogs, badges, updatedEntries);
  };

  // Incident & Victory Actions
  const handleLogIncident = (incident: Omit<IncidentLog, 'id' | 'timestamp'>) => {
    const newLog: IncidentLog = {
      ...incident,
      id: `incident-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updatedLogs = [...incidentLogs, newLog];
    setIncidentLogs(updatedLogs);

    // Apply point changes
    handleAddPDP(incident.pdpDelta, incident.description);
  };

  return (
    <div className="min-h-screen bg-[#0d0e10] text-[#e0e0e0] font-sans antialiased selection:bg-amber-500 selection:text-black">
      
      {/* HEADER SECTION */}
      <header className="border-b border-white/10 bg-[#121417] sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-200 to-amber-500 text-[#0d0e10] font-mono font-black tracking-widest text-lg w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/10">
              T
            </div>
            <div>
              <h1 className="text-xl font-sans font-bold tracking-tight flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent font-extrabold tracking-tighter">TEMPOS</span>
                <span className="text-[10px] font-mono font-bold bg-white/5 text-amber-200 px-1.5 py-0.5 rounded border border-white/10">v1.0</span>
              </h1>
              <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Product Design & Interactive Prototype</p>
            </div>
          </div>

          {/* Right Controls / Stats */}
          {profile && (
            <div className="flex items-center gap-4 bg-[#16181d] border border-white/5 rounded-xl px-4 py-2 shadow-inner" id="header-user-badge">
              <div className="text-left">
                <span className="text-[9px] text-white/30 font-mono uppercase block tracking-wider">Rendimiento</span>
                <span className="text-xs font-bold text-white leading-none">
                  {profile.name} <span className="text-[10px] font-mono text-amber-400 font-normal">Nivel {profile.level}</span>
                </span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-[9px] text-white/30 font-mono uppercase block tracking-wider">Puntos PDP</span>
                <span className="text-xs font-mono font-black text-amber-400 leading-none">{profile.pdp}</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <button
                type="button"
                onClick={() => setActiveProtoTab('motivation')}
                className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer"
                title="Ir al Centro de Motivación de Justin"
              >
                <Flame size={12} className="text-amber-400" /> Modo Bestia
              </button>
              <button
                id="reset-profile-btn"
                type="button"
                onClick={() => setShowResetModal(true)}
                className="p-1 text-white/40 hover:text-amber-200 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                title="Reiniciar Perfil y Onboarding"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          )}

        </div>
      </header>

      {/* BODY WRAPPER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* If Onboarding is not completed, show Onboarding Flow */}
        {!profile || !profile.onboarded ? (
          <div className="py-6">
            <Onboarding onComplete={handleOnboardingComplete} />
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* MAIN NAVIGATION TAB SWITCH (Prototype vs Blueprint Specs) */}
            <div className="flex border-b border-white/10" id="main-navigation-tabs">
              <button
                id="tab-btn-prototype"
                type="button"
                onClick={() => {
                  setActiveMainTab('prototype');
                }}
                className={`py-3 px-6 text-xs uppercase tracking-widest font-bold border-b-2 cursor-pointer transition-all ${
                  activeMainTab === 'prototype'
                    ? 'border-amber-400 text-amber-200 bg-white/5'
                    : 'border-transparent text-white/40 hover:text-white'
                }`}
              >
                🛠️ PROTOTIPO INTERACTIVO
              </button>
              
              <button
                id="tab-btn-blueprint"
                type="button"
                onClick={() => {
                  setActiveMainTab('blueprint');
                }}
                className={`py-3 px-6 text-xs uppercase tracking-widest font-bold border-b-2 cursor-pointer transition-all ${
                  activeMainTab === 'blueprint'
                    ? 'border-amber-400 text-amber-200 bg-white/5'
                    : 'border-transparent text-white/40 hover:text-white'
                }`}
              >
                📐 BLUEPRINT & ESPECIFICACIÓN TÉCNICA
              </button>
            </div>

            {/* TAB CONTAINER 1: INTERACTIVE PROTOTYPE */}
            {activeMainTab === 'prototype' && (
              <div className="space-y-6">

                {/* GUÍA DE BIENVENIDA Y USO RÁPIDO PARA ERNESTO */}
                <div className="bg-gradient-to-br from-[#1b1c21] to-[#121417] border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  {/* Subtle decorative background light */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                        <HelpCircle size={22} className="animate-pulse text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-sans font-bold text-white flex items-center gap-2">
                          💡 Guía de Uso Rápido para Justin 
                          <span className="text-[10px] font-mono font-normal text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 animate-pulse">¡Léeme Primero!</span>
                        </h3>
                        <p className="text-xs text-white/50 mt-0.5">Sigue estos simples pasos para ver la aplicación funcionando en menos de 1 minuto.</p>
                      </div>
                    </div>
                    
                    <button
                      id="toggle-guide-btn"
                      type="button"
                      onClick={() => {
                        const nextState = !showGuide;
                        setShowGuide(nextState);
                        safeStorage.setItem('tempos_show_guide', String(nextState));
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-amber-200 hover:text-white rounded-lg flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-center"
                    >
                      {showGuide ? (
                        <>Ocultar Guía <ChevronUp size={14} /></>
                      ) : (
                        <>Mostrar Guía de Uso <ChevronDown size={14} /></>
                      )}
                    </button>
                  </div>

                  {showGuide && (
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                      
                      <div className="bg-[#121417]/80 border border-white/5 p-4 rounded-xl flex flex-col justify-between h-full hover:border-amber-500/20 transition-all">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-[10px] flex items-center justify-center">1</span>
                            <span className="font-bold text-white uppercase tracking-wider text-[10px]">Paso 1: Agenda</span>
                          </div>
                          <p className="text-white/60 leading-relaxed text-[11px]">
                            Ve al <strong className="text-amber-200">Gestor de Tiempo</strong>, pon una tarea y haz clic en <strong className="text-amber-200">"Agendar"</strong>. ¡Recibirás tus primeros <strong>+10 puntos</strong> (PDP)!
                          </p>
                        </div>
                        <button 
                          onClick={() => setActiveProtoTab('scheduler')}
                          className="mt-3 text-left text-[10px] text-amber-400 font-bold hover:underline cursor-pointer"
                        >
                          Ir al Gestor →
                        </button>
                      </div>

                      <div className="bg-[#121417]/80 border border-white/5 p-4 rounded-xl flex flex-col justify-between h-full hover:border-amber-500/20 transition-all">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-[10px] flex items-center justify-center">2</span>
                            <span className="font-bold text-white uppercase tracking-wider text-[10px]">Paso 2: Pomodoro</span>
                          </div>
                          <p className="text-white/60 leading-relaxed text-[11px]">
                            Dale <strong className="text-amber-200">Play</strong> al círculo del Pomodoro. <span className="italic text-white/40">(Tip: Para ver cómo ganas <strong>+50 puntos</strong> rápido, selecciona la pestaña "Corto (5m)" y déjala terminar).</span>
                          </p>
                        </div>
                        <button 
                          onClick={() => setActiveProtoTab('scheduler')}
                          className="mt-3 text-left text-[10px] text-amber-400 font-bold hover:underline cursor-pointer"
                        >
                          Probar Pomodoro →
                        </button>
                      </div>

                      <div className="bg-[#121417]/80 border border-white/5 p-4 rounded-xl flex flex-col justify-between h-full hover:border-amber-500/20 transition-all">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-[10px] flex items-center justify-center">3</span>
                            <span className="font-bold text-white uppercase tracking-wider text-[10px]">Paso 3: Conducta</span>
                          </div>
                          <p className="text-white/60 leading-relaxed text-[11px]">
                            Ve a <strong className="text-amber-200">Diagnóstico</strong>. Registra una <strong className="text-emerald-400">"Victoria"</strong> (+40 PDP) o un <strong className="text-rose-400">"Relapso"</strong> (-20 PDP). Verás cómo cambia el gráfico semanal al instante.
                          </p>
                        </div>
                        <button 
                          onClick={() => setActiveProtoTab('diagnostics')}
                          className="mt-3 text-left text-[10px] text-amber-400 font-bold hover:underline cursor-pointer"
                        >
                          Ir a Diagnóstico →
                        </button>
                      </div>

                      <div className="bg-[#121417]/80 border border-white/5 p-4 rounded-xl flex flex-col justify-between h-full hover:border-amber-500/20 transition-all">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-[10px] flex items-center justify-center">4</span>
                            <span className="font-bold text-white uppercase tracking-wider text-[10px]">Paso 4: Sabiduría</span>
                          </div>
                          <p className="text-white/60 leading-relaxed text-[11px]">
                            En <strong className="text-amber-200">Motor de Motivación</strong>, escucha el <strong className="text-amber-200">Discurso de Poder para Justin</strong>, pulveriza excusas y activa las ondas binaurales de Modo Monje. ¡Gana <strong>+20 PDP</strong>!
                          </p>
                        </div>
                        <button 
                          onClick={() => setActiveProtoTab('motivation')}
                          className="mt-3 text-left text-[10px] text-amber-400 font-bold hover:underline cursor-pointer"
                        >
                          Ir a Motivación →
                        </button>
                      </div>

                      <div className="bg-[#121417]/80 border border-white/5 p-4 rounded-xl flex flex-col justify-between h-full hover:border-amber-500/20 transition-all">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-[10px] flex items-center justify-center">5</span>
                            <span className="font-bold text-white uppercase tracking-wider text-[10px]">Paso 5: Medallas</span>
                          </div>
                          <p className="text-white/60 leading-relaxed text-[11px]">
                            En <strong className="text-amber-200">Gamificación</strong>, revisa tus medallas desbloqueadas y tu nivel. Conforme acumules PDP, ¡desbloquearás nuevos rangos!
                          </p>
                        </div>
                        <button 
                          onClick={() => setActiveProtoTab('gamification')}
                          className="mt-3 text-left text-[10px] text-amber-400 font-bold hover:underline cursor-pointer"
                        >
                          Ver Medallas →
                        </button>
                      </div>

                      <div className="bg-[#121417]/80 border border-amber-500/20 p-4 rounded-xl flex flex-col justify-between h-full hover:border-amber-500/40 transition-all">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-bold text-[10px] flex items-center justify-center">6</span>
                            <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px]">Paso 6: Tendencia PDP</span>
                          </div>
                          <p className="text-white/60 leading-relaxed text-[11px]">
                            En <strong className="text-amber-200">Tendencia PDP</strong>, analiza tus últimas 2 semanas con gráficos <strong className="text-amber-200">Recharts</strong> divididos en Productividad, Disciplina y Propósito.
                          </p>
                        </div>
                        <button 
                          onClick={() => setActiveProtoTab('analytics')}
                          className="mt-3 text-left text-[10px] text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          Ver Gráficos PDP →
                        </button>
                      </div>

                    </div>
                  )}
                </div>
                
                {/* Proto Sub-Tabs Navigation bar */}
                <div className="flex flex-wrap gap-2 bg-[#121417] border border-white/10 p-1.5 rounded-xl max-w-4xl" id="proto-subtabs">
                  <button
                    id="proto-tab-scheduler"
                    type="button"
                    onClick={() => setActiveProtoTab('scheduler')}
                    className={`flex-1 min-w-[130px] py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeProtoTab === 'scheduler' ? 'bg-amber-500 text-[#0d0e10] shadow-sm font-bold' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <Clock size={14} />
                    Gestor de Tiempo
                  </button>
                  <button
                    id="proto-tab-diagnostics"
                    type="button"
                    onClick={() => setActiveProtoTab('diagnostics')}
                    className={`flex-1 min-w-[130px] py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeProtoTab === 'diagnostics' ? 'bg-amber-500 text-[#0d0e10] shadow-sm font-bold' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <ShieldAlert size={14} />
                    Diagnóstico y Mejora
                  </button>
                  <button
                    id="proto-tab-motivation"
                    type="button"
                    onClick={() => setActiveProtoTab('motivation')}
                    className={`flex-1 min-w-[130px] py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeProtoTab === 'motivation' ? 'bg-amber-500 text-[#0d0e10] shadow-sm font-bold' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <Sparkles size={14} />
                    Motor de Motivación
                  </button>
                  <button
                    id="proto-tab-gamification"
                    type="button"
                    onClick={() => setActiveProtoTab('gamification')}
                    className={`flex-1 min-w-[130px] py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeProtoTab === 'gamification' ? 'bg-amber-500 text-[#0d0e10] shadow-sm font-bold' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <Award size={14} />
                    Gamificación & Streaks
                  </button>
                  <button
                    id="proto-tab-analytics"
                    type="button"
                    onClick={() => setActiveProtoTab('analytics')}
                    className={`flex-1 min-w-[140px] py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeProtoTab === 'analytics' ? 'bg-amber-500 text-[#0d0e10] shadow-sm font-bold' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <TrendingUp size={14} />
                    Tendencia PDP (14 Días)
                  </button>
                  <button
                    id="proto-tab-journal"
                    type="button"
                    onClick={() => setActiveProtoTab('journal')}
                    className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      activeProtoTab === 'journal' ? 'bg-amber-500 text-[#0d0e10] shadow-sm font-bold' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <BookOpen size={14} />
                    Diario Estoico
                  </button>
                </div>

                {/* Sub-Tab renders */}
                {activeProtoTab === 'scheduler' && (
                  <TimeManager
                    profile={profile}
                    timeBlocks={timeBlocks}
                    onAddBlock={handleAddBlock}
                    onCompleteBlock={handleCompleteBlock}
                    onDeleteBlock={handleDeleteBlock}
                    onAddPDP={handleAddPDP}
                  />
                )}

                {activeProtoTab === 'diagnostics' && (
                  <Diagnostics
                    profile={profile}
                    incidentLogs={incidentLogs}
                    onLogIncident={handleLogIncident}
                    onNavigateToAnalytics={() => setActiveProtoTab('analytics')}
                  />
                )}

                {activeProtoTab === 'motivation' && (
                  <MotivationEngine
                    profile={profile}
                    onAddPDP={handleAddPDP}
                  />
                )}

                {activeProtoTab === 'gamification' && (
                  <Gamification
                    profile={profile}
                    badges={badges}
                    onNavigateToAnalytics={() => setActiveProtoTab('analytics')}
                  />
                )}

                {activeProtoTab === 'analytics' && (
                  <PDPProgressChart
                    profile={profile}
                    incidentLogs={incidentLogs}
                    timeBlocks={timeBlocks}
                    journalEntries={journalEntries}
                    onAddPDP={handleAddPDP}
                  />
                )}

                {activeProtoTab === 'journal' && (
                  <StoicJournal
                    profile={profile}
                    onAddPDP={handleAddPDP}
                    journalEntries={journalEntries}
                    onSaveEntry={handleSaveJournalEntry}
                    onDeleteEntry={handleDeleteJournalEntry}
                  />
                )}

              </div>
            )}

            {/* TAB CONTAINER 2: ARCHITECTURE SPEC BLUEPRINT */}
            {activeMainTab === 'blueprint' && <BlueprintView />}

          </div>
        )}

        {/* IN-APP RESET PROFILE MODAL (REPLACES WINDOW.CONFIRM) */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#16181d] border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-amber-400">
                  <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <AlertTriangle size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white">¿Reiniciar Perfil y Disciplina?</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-white/70 leading-relaxed">
                Esta acción restablecerá el simulador a los valores iniciales para <strong>Justin</strong>. Se reiniciarán tus bloques de tiempo, registros de incidentes y puntos PDP acumulados.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold rounded-xl border border-white/10 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="confirm-reset-profile-btn"
                  type="button"
                  onClick={executeResetProfile}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw size={12} /> Confirmar Reinicio
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#121417] py-8 mt-16 text-white/30 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 TEMPOS Product Spec Hub. Todos los derechos reservados.</p>
          <p className="font-mono text-[10px] tracking-widest text-white/20">
            SYSTEM VERSION 4.0.2 | ENCRYPTED | NO-SQL ARCHITECTURE
          </p>
        </div>
      </footer>

    </div>
  );
}
